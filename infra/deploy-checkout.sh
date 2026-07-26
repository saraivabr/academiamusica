#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
TABLE_NAME="academia-musica-orders"
EVENTS_TABLE_NAME="academia-musica-events"
EVENTS_ORDER_INDEX="order-created-at-index"
FUNCTION_NAME="academia-musica-checkout"
ROLE_NAME="academia-musica-checkout-lambda"
API_NAME="academia-musica-checkout"
WOOVI_PARAMETER="/academia-musica/prod/woovi/app-id"
WEBHOOK_PARAMETER="/academia-musica/prod/woovi/webhook-secret"
ACCESS_PARAMETER="/academia-musica/prod/access-secret"
SUNO_API_KEY_PARAMETER="/academia-musica/prod/suno/api-key"
IMAGE_PROXY_KEY_PARAMETER="/academia-musica/prod/image-proxy-key"
COVERS_BUCKET="academia-musica-covers-${ACCOUNT_ID}-${AWS_REGION}"
SITE_ORIGIN="https://musicacom.ia.br"

if ! aws dynamodb describe-table --region "$AWS_REGION" --table-name "$TABLE_NAME" >/dev/null 2>&1; then
  aws dynamodb create-table \
    --region "$AWS_REGION" \
    --table-name "$TABLE_NAME" \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST >/dev/null
  aws dynamodb wait table-exists --region "$AWS_REGION" --table-name "$TABLE_NAME"
  aws dynamodb update-time-to-live \
    --region "$AWS_REGION" \
    --table-name "$TABLE_NAME" \
    --time-to-live-specification Enabled=true,AttributeName=ttl >/dev/null
  aws dynamodb update-continuous-backups \
    --region "$AWS_REGION" \
    --table-name "$TABLE_NAME" \
    --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true >/dev/null
fi

if ! aws dynamodb describe-table --region "$AWS_REGION" --table-name "$EVENTS_TABLE_NAME" >/dev/null 2>&1; then
  aws dynamodb create-table \
    --region "$AWS_REGION" \
    --table-name "$EVENTS_TABLE_NAME" \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST >/dev/null
  aws dynamodb wait table-exists --region "$AWS_REGION" --table-name "$EVENTS_TABLE_NAME"
  aws dynamodb update-time-to-live \
    --region "$AWS_REGION" \
    --table-name "$EVENTS_TABLE_NAME" \
    --time-to-live-specification Enabled=true,AttributeName=ttl >/dev/null
  aws dynamodb update-continuous-backups \
    --region "$AWS_REGION" \
    --table-name "$EVENTS_TABLE_NAME" \
    --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true >/dev/null
fi

if [[ "$(aws dynamodb describe-table \
  --region "$AWS_REGION" \
  --table-name "$EVENTS_TABLE_NAME" \
  --query "Table.GlobalSecondaryIndexes[?IndexName=='${EVENTS_ORDER_INDEX}'].IndexName | [0]" \
  --output text)" == "None" ]]; then
  aws dynamodb update-table \
    --region "$AWS_REGION" \
    --table-name "$EVENTS_TABLE_NAME" \
    --attribute-definitions AttributeName=orderId,AttributeType=S AttributeName=createdAt,AttributeType=S \
    --global-secondary-index-updates "[{\"Create\":{\"IndexName\":\"${EVENTS_ORDER_INDEX}\",\"KeySchema\":[{\"AttributeName\":\"orderId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"createdAt\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}}]" >/dev/null
  aws dynamodb wait table-exists --region "$AWS_REGION" --table-name "$EVENTS_TABLE_NAME"
fi

if ! aws s3api head-bucket --bucket "$COVERS_BUCKET" >/dev/null 2>&1; then
  aws s3api create-bucket \
    --region "$AWS_REGION" \
    --bucket "$COVERS_BUCKET" >/dev/null
fi
aws s3api put-public-access-block \
  --region "$AWS_REGION" \
  --bucket "$COVERS_BUCKET" \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
aws s3api put-bucket-encryption \
  --region "$AWS_REGION" \
  --bucket "$COVERS_BUCKET" \
  --server-side-encryption-configuration \
    '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
aws s3api put-bucket-lifecycle-configuration \
  --region "$AWS_REGION" \
  --bucket "$COVERS_BUCKET" \
  --lifecycle-configuration \
    '{"Rules":[{"ID":"expire-cover-jobs","Status":"Enabled","Filter":{"Prefix":"jobs/"},"Expiration":{"Days":1},"AbortIncompleteMultipartUpload":{"DaysAfterInitiation":1}}]}'

TRUST_POLICY="$(mktemp)"
PERMISSIONS_POLICY="$(mktemp)"
PACKAGE_DIR="$(mktemp -d)"
trap 'rm -f "$TRUST_POLICY" "$PERMISSIONS_POLICY"; rm -rf "$PACKAGE_DIR"' EXIT

cat >"$TRUST_POLICY" <<'JSON'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "lambda.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
JSON

if ! aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
  aws iam create-role \
    --role-name "$ROLE_NAME" \
    --assume-role-policy-document "file://$TRUST_POLICY" >/dev/null
  aws iam attach-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
fi

cat >"$PERMISSIONS_POLICY" <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:Query", "dynamodb:UpdateItem"],
      "Resource": [
        "arn:aws:dynamodb:${AWS_REGION}:${ACCOUNT_ID}:table/${TABLE_NAME}",
        "arn:aws:dynamodb:${AWS_REGION}:${ACCOUNT_ID}:table/${EVENTS_TABLE_NAME}",
        "arn:aws:dynamodb:${AWS_REGION}:${ACCOUNT_ID}:table/${EVENTS_TABLE_NAME}/index/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "ssm:GetParameter",
      "Resource": [
        "arn:aws:ssm:${AWS_REGION}:${ACCOUNT_ID}:parameter${WOOVI_PARAMETER}",
        "arn:aws:ssm:${AWS_REGION}:${ACCOUNT_ID}:parameter${WEBHOOK_PARAMETER}",
        "arn:aws:ssm:${AWS_REGION}:${ACCOUNT_ID}:parameter${ACCESS_PARAMETER}",
        "arn:aws:ssm:${AWS_REGION}:${ACCOUNT_ID}:parameter${SUNO_API_KEY_PARAMETER}",
        "arn:aws:ssm:${AWS_REGION}:${ACCOUNT_ID}:parameter${IMAGE_PROXY_KEY_PARAMETER}"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "bedrock:InvokeModel",
      "Resource": [
        "arn:aws:bedrock:us-east-1:${ACCOUNT_ID}:inference-profile/us.amazon.nova-2-lite-v1:0",
        "arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-2-lite-v1:0",
        "arn:aws:bedrock:us-east-2::foundation-model/amazon.nova-2-lite-v1:0",
        "arn:aws:bedrock:us-west-2::foundation-model/amazon.nova-2-lite-v1:0",
        "arn:aws:bedrock:us-west-2::foundation-model/amazon.nova-2-lite-v1:0"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": [
        "arn:aws:s3:::${COVERS_BUCKET}/covers/*",
        "arn:aws:s3:::${COVERS_BUCKET}/jobs/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": "arn:aws:lambda:${AWS_REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME}"
    }
  ]
}
JSON

aws iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name checkout-runtime \
  --policy-document "file://$PERMISSIONS_POLICY"

cp infra/checkout/index.mjs "$PACKAGE_DIR/index.mjs"
(cd "$PACKAGE_DIR" && zip -q function.zip index.mjs)

ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"
ENVIRONMENT="Variables={TABLE_NAME=${TABLE_NAME},EVENTS_TABLE_NAME=${EVENTS_TABLE_NAME},COVERS_BUCKET=${COVERS_BUCKET},SITE_ORIGIN=${SITE_ORIGIN},PUBLIC_API_URL=https://fb9323mkb2.execute-api.${AWS_REGION}.amazonaws.com,PRICE_CENTS=19700,WOOVI_APP_ID_PARAMETER=${WOOVI_PARAMETER},WEBHOOK_SECRET_PARAMETER=${WEBHOOK_PARAMETER},ACCESS_SECRET_PARAMETER=${ACCESS_PARAMETER},SUNO_API_KEY_PARAMETER=${SUNO_API_KEY_PARAMETER},IMAGE_PROXY_KEY_PARAMETER=${IMAGE_PROXY_KEY_PARAMETER},IMAGE_API_URL=https://academiamusica-image-proxy.fellipesaraivabarbosa.workers.dev,IMAGE_MODEL=cx/gpt-5.5,MUSIC_TRACKS_INCLUDED=25,MUSIC_CONVERSATION_ENABLED=true,MUSIC_CONVERSATION_MODEL=us.amazon.nova-2-lite-v1:0}"

if aws lambda get-function --region "$AWS_REGION" --function-name "$FUNCTION_NAME" >/dev/null 2>&1; then
  aws lambda wait function-active-v2 --region "$AWS_REGION" --function-name "$FUNCTION_NAME"
  aws lambda update-function-code \
    --region "$AWS_REGION" \
    --function-name "$FUNCTION_NAME" \
    --zip-file "fileb://$PACKAGE_DIR/function.zip" >/dev/null
  aws lambda wait function-updated --region "$AWS_REGION" --function-name "$FUNCTION_NAME"
  aws lambda update-function-configuration \
    --region "$AWS_REGION" \
    --function-name "$FUNCTION_NAME" \
    --runtime nodejs22.x \
    --handler index.handler \
    --timeout 600 \
    --memory-size 1024 \
    --environment "$ENVIRONMENT" >/dev/null
else
  sleep 8
  aws lambda create-function \
    --region "$AWS_REGION" \
    --function-name "$FUNCTION_NAME" \
    --runtime nodejs22.x \
    --handler index.handler \
    --timeout 600 \
    --memory-size 1024 \
    --role "$ROLE_ARN" \
    --environment "$ENVIRONMENT" \
    --zip-file "fileb://$PACKAGE_DIR/function.zip" >/dev/null
fi

API_ID="$(aws apigatewayv2 get-apis \
  --region "$AWS_REGION" \
  --query "Items[?Name=='${API_NAME}'].ApiId | [0]" \
  --output text)"

if [[ "$API_ID" == "None" || -z "$API_ID" ]]; then
  API_ID="$(aws apigatewayv2 create-api \
    --region "$AWS_REGION" \
    --name "$API_NAME" \
    --protocol-type HTTP \
    --cors-configuration "AllowOrigins=${SITE_ORIGIN},AllowMethods=GET,POST,OPTIONS,AllowHeaders=content-type,authorization,MaxAge=3600" \
    --query ApiId \
    --output text)"
fi

FUNCTION_ARN="$(aws lambda get-function \
  --region "$AWS_REGION" \
  --function-name "$FUNCTION_NAME" \
  --query Configuration.FunctionArn \
  --output text)"

INTEGRATION_ID="$(aws apigatewayv2 get-integrations \
  --region "$AWS_REGION" \
  --api-id "$API_ID" \
  --query "Items[?IntegrationUri=='${FUNCTION_ARN}'].IntegrationId | [0]" \
  --output text)"

if [[ "$INTEGRATION_ID" == "None" || -z "$INTEGRATION_ID" ]]; then
  INTEGRATION_ID="$(aws apigatewayv2 create-integration \
    --region "$AWS_REGION" \
    --api-id "$API_ID" \
    --integration-type AWS_PROXY \
    --integration-uri "$FUNCTION_ARN" \
    --payload-format-version 2.0 \
    --query IntegrationId \
    --output text)"
fi

ROUTE_ID="$(aws apigatewayv2 get-routes \
  --region "$AWS_REGION" \
  --api-id "$API_ID" \
  --query "Items[?RouteKey=='\$default'].RouteId | [0]" \
  --output text)"

if [[ "$ROUTE_ID" == "None" || -z "$ROUTE_ID" ]]; then
  aws apigatewayv2 create-route \
    --region "$AWS_REGION" \
    --api-id "$API_ID" \
    --route-key '$default' \
    --target "integrations/${INTEGRATION_ID}" >/dev/null
fi

STAGE_NAME="$(aws apigatewayv2 get-stages \
  --region "$AWS_REGION" \
  --api-id "$API_ID" \
  --query "Items[?StageName=='\$default'].StageName | [0]" \
  --output text)"

if [[ "$STAGE_NAME" == "None" || -z "$STAGE_NAME" ]]; then
  aws apigatewayv2 create-stage \
    --region "$AWS_REGION" \
    --api-id "$API_ID" \
    --stage-name '$default' \
    --auto-deploy \
    --default-route-settings ThrottlingBurstLimit=10,ThrottlingRateLimit=5 >/dev/null
fi

aws lambda add-permission \
  --region "$AWS_REGION" \
  --function-name "$FUNCTION_NAME" \
  --statement-id apigateway-checkout \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${AWS_REGION}:${ACCOUNT_ID}:${API_ID}/*/*" >/dev/null 2>&1 || true

echo "https://${API_ID}.execute-api.${AWS_REGION}.amazonaws.com"
