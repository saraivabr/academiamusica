#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
DISTRIBUTION_ID="${DISTRIBUTION_ID:-E7L2G8OQTXQNS}"
FUNCTION_NAME="academia-musica-static-routing"
ACCESS_PARAMETER="/academia-musica/prod/access-secret"
FUNCTION_CODE="$(mktemp)"
CONFIG_FILE="$(mktemp)"
UPDATED_CONFIG="$(mktemp)"
trap 'rm -f "$FUNCTION_CODE" "$CONFIG_FILE" "$UPDATED_CONFIG"' EXIT

ACCESS_SECRET="$(aws ssm get-parameter \
  --region "$AWS_REGION" \
  --name "$ACCESS_PARAMETER" \
  --with-decryption \
  --query Parameter.Value \
  --output text)"
sed "s/__ACCESS_SECRET__/${ACCESS_SECRET}/g" infra/cloudfront-rewrite.js >"$FUNCTION_CODE"

if aws cloudfront describe-function --name "$FUNCTION_NAME" >/dev/null 2>&1; then
  FUNCTION_ETAG="$(aws cloudfront describe-function --name "$FUNCTION_NAME" --query ETag --output text)"
  aws cloudfront update-function \
    --name "$FUNCTION_NAME" \
    --if-match "$FUNCTION_ETAG" \
    --function-config Comment="Resolve rotas estaticas do Next.js para index.html",Runtime=cloudfront-js-2.0 \
    --function-code "fileb://$FUNCTION_CODE" >/dev/null
else
  aws cloudfront create-function \
    --name "$FUNCTION_NAME" \
    --function-config Comment="Resolve rotas estaticas do Next.js para index.html",Runtime=cloudfront-js-2.0 \
    --function-code "fileb://$FUNCTION_CODE" >/dev/null
fi

FUNCTION_ETAG="$(aws cloudfront describe-function --name "$FUNCTION_NAME" --query ETag --output text)"
FUNCTION_ARN="$(aws cloudfront publish-function \
  --name "$FUNCTION_NAME" \
  --if-match "$FUNCTION_ETAG" \
  --query FunctionSummary.FunctionMetadata.FunctionARN \
  --output text)"

DIST_ETAG="$(aws cloudfront get-distribution-config \
  --id "$DISTRIBUTION_ID" \
  --query ETag \
  --output text)"
aws cloudfront get-distribution-config \
  --id "$DISTRIBUTION_ID" \
  --query DistributionConfig \
  --output json >"$CONFIG_FILE"

jq --arg arn "$FUNCTION_ARN" '
  .DefaultCacheBehavior.FunctionAssociations = {
    Quantity: 1,
    Items: [{EventType: "viewer-request", FunctionARN: $arn}]
  }
' "$CONFIG_FILE" >"$UPDATED_CONFIG"

aws cloudfront update-distribution \
  --id "$DISTRIBUTION_ID" \
  --if-match "$DIST_ETAG" \
  --distribution-config "file://$UPDATED_CONFIG" \
  --query 'Distribution.{Id:Id,Status:Status}' \
  --output json
