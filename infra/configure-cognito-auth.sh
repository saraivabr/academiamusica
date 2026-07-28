#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
COGNITO_POOL_NAME="${COGNITO_POOL_NAME:-academia-musica-users}"
COGNITO_CLIENT_NAME="${COGNITO_CLIENT_NAME:-academia-musica-web}"
COGNITO_DOMAIN_PREFIX="${COGNITO_DOMAIN_PREFIX:-musicacom-ia}"
SITE_ORIGIN="${SITE_ORIGIN:-https://musicacom.ia.br}"
GOOGLE_CLIENT_ID_PARAMETER="${GOOGLE_CLIENT_ID_PARAMETER:-/academia-musica/prod/google/client-id}"
GOOGLE_CLIENT_SECRET_PARAMETER="${GOOGLE_CLIENT_SECRET_PARAMETER:-/academia-musica/prod/google/client-secret}"
EMAIL_TEMPLATE_PATH="${EMAIL_TEMPLATE_PATH:-infra/cognito/verification-email.html}"
EMAIL_SUBJECT="${EMAIL_SUBJECT:-Seu código para abrir o estúdio musicacom.ia}"

for command in aws jq; do
  command -v "$command" >/dev/null || {
    echo "Missing required command: $command" >&2
    exit 1
  }
done

[[ -f "$EMAIL_TEMPLATE_PATH" ]] || {
  echo "Email template not found: $EMAIL_TEMPLATE_PATH" >&2
  exit 1
}
grep -q '{####}' "$EMAIL_TEMPLATE_PATH" || {
  echo "Email template must contain the Cognito code placeholder {####}." >&2
  exit 1
}

COGNITO_USER_POOL_ID="$(aws cognito-idp list-user-pools \
  --region "$AWS_REGION" \
  --max-results 60 \
  --query "UserPools[?Name=='${COGNITO_POOL_NAME}'].Id | [0]" \
  --output text)"
[[ "$COGNITO_USER_POOL_ID" != "None" && -n "$COGNITO_USER_POOL_ID" ]] || {
  echo "Cognito user pool not found: $COGNITO_POOL_NAME" >&2
  exit 1
}

COGNITO_CLIENT_ID="$(aws cognito-idp list-user-pool-clients \
  --region "$AWS_REGION" \
  --user-pool-id "$COGNITO_USER_POOL_ID" \
  --max-results 60 \
  --query "UserPoolClients[?ClientName=='${COGNITO_CLIENT_NAME}'].ClientId | [0]" \
  --output text)"
[[ "$COGNITO_CLIENT_ID" != "None" && -n "$COGNITO_CLIENT_ID" ]] || {
  echo "Cognito app client not found: $COGNITO_CLIENT_NAME" >&2
  exit 1
}

TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT
chmod 700 "$TEMP_DIR"

aws cognito-idp describe-user-pool \
  --region "$AWS_REGION" \
  --user-pool-id "$COGNITO_USER_POOL_ID" \
  --output json \
  | jq \
    --rawfile email "$EMAIL_TEMPLATE_PATH" \
    --arg subject "$EMAIL_SUBJECT" '
      .UserPool as $pool
      | {UserPoolId: $pool.Id, PoolName: $pool.Name}
      + (reduce [
          "Policies",
          "DeletionProtection",
          "LambdaConfig",
          "AutoVerifiedAttributes",
          "UserAttributeUpdateSettings",
          "MfaConfiguration",
          "EmailConfiguration",
          "AdminCreateUserConfig",
          "AccountRecoverySetting",
          "UserPoolTier",
          "UserPoolTags",
          "UserPoolAddOns",
          "DeviceConfiguration",
          "SmsConfiguration"
        ][] as $key ({};
          if $pool[$key] != null then .[$key] = $pool[$key] else . end
        ))
      | .VerificationMessageTemplate = {
          DefaultEmailOption: "CONFIRM_WITH_CODE",
          EmailSubject: $subject,
          EmailMessage: $email
        }
    ' > "$TEMP_DIR/user-pool-update.json"

aws cognito-idp update-user-pool \
  --region "$AWS_REGION" \
  --cli-input-json "file://$TEMP_DIR/user-pool-update.json"

DOMAIN_POOL_ID="$(aws cognito-idp describe-user-pool-domain \
  --region "$AWS_REGION" \
  --domain "$COGNITO_DOMAIN_PREFIX" \
  --query 'DomainDescription.UserPoolId' \
  --output text 2>/dev/null || true)"
if [[ "$DOMAIN_POOL_ID" != "$COGNITO_USER_POOL_ID" ]]; then
  aws cognito-idp create-user-pool-domain \
    --region "$AWS_REGION" \
    --domain "$COGNITO_DOMAIN_PREFIX" \
    --user-pool-id "$COGNITO_USER_POOL_ID" \
    --managed-login-version 2 >/dev/null
fi

if ! GOOGLE_CLIENT_ID="$(aws ssm get-parameter \
  --region "$AWS_REGION" \
  --name "$GOOGLE_CLIENT_ID_PARAMETER" \
  --with-decryption \
  --query Parameter.Value \
  --output text 2>/dev/null)" \
  || ! GOOGLE_CLIENT_SECRET="$(aws ssm get-parameter \
    --region "$AWS_REGION" \
    --name "$GOOGLE_CLIENT_SECRET_PARAMETER" \
    --with-decryption \
    --query Parameter.Value \
    --output text 2>/dev/null)"; then
  echo "Cognito email and OAuth domain configured."
  echo "Google login pending secure parameters: $GOOGLE_CLIENT_ID_PARAMETER and $GOOGLE_CLIENT_SECRET_PARAMETER"
  exit 0
fi

jq -n \
  --arg pool "$COGNITO_USER_POOL_ID" \
  --arg client_id "$GOOGLE_CLIENT_ID" \
  --arg client_secret "$GOOGLE_CLIENT_SECRET" '{
    UserPoolId: $pool,
    ProviderName: "Google",
    ProviderType: "Google",
    ProviderDetails: {
      client_id: $client_id,
      client_secret: $client_secret,
      authorize_scopes: "openid email profile"
    },
    AttributeMapping: {
      email: "email",
      email_verified: "email_verified",
      name: "name",
      username: "sub"
    }
  }' > "$TEMP_DIR/google-provider.json"
chmod 600 "$TEMP_DIR/google-provider.json"

if aws cognito-idp describe-identity-provider \
  --region "$AWS_REGION" \
  --user-pool-id "$COGNITO_USER_POOL_ID" \
  --provider-name Google >/dev/null 2>&1; then
  jq 'del(.ProviderType)' "$TEMP_DIR/google-provider.json" > "$TEMP_DIR/google-provider-update.json"
  chmod 600 "$TEMP_DIR/google-provider-update.json"
  aws cognito-idp update-identity-provider \
    --region "$AWS_REGION" \
    --cli-input-json "file://$TEMP_DIR/google-provider-update.json" >/dev/null
else
  aws cognito-idp create-identity-provider \
    --region "$AWS_REGION" \
    --cli-input-json "file://$TEMP_DIR/google-provider.json" >/dev/null
fi

CALLBACK_URL="${SITE_ORIGIN}/login/google/callback/"
LOGOUT_URL="${SITE_ORIGIN}/login/"
aws cognito-idp describe-user-pool-client \
  --region "$AWS_REGION" \
  --user-pool-id "$COGNITO_USER_POOL_ID" \
  --client-id "$COGNITO_CLIENT_ID" \
  --output json \
  | jq \
    --arg callback "$CALLBACK_URL" \
    --arg logout "$LOGOUT_URL" '
      .UserPoolClient as $client
      | {UserPoolId: $client.UserPoolId, ClientId: $client.ClientId}
      + (reduce [
          "ClientName",
          "RefreshTokenValidity",
          "AccessTokenValidity",
          "IdTokenValidity",
          "TokenValidityUnits",
          "ExplicitAuthFlows",
          "PreventUserExistenceErrors",
          "EnableTokenRevocation",
          "EnablePropagateAdditionalUserContextData",
          "AuthSessionValidity",
          "ReadAttributes",
          "WriteAttributes",
          "AnalyticsConfiguration",
          "RefreshTokenRotation"
        ][] as $key ({};
          if $client[$key] != null then .[$key] = $client[$key] else . end
        ))
      | .CallbackURLs = [$callback]
      | .LogoutURLs = [$logout]
      | .SupportedIdentityProviders = ["COGNITO", "Google"]
      | .AllowedOAuthFlows = ["code"]
      | .AllowedOAuthScopes = ["openid", "email", "profile"]
      | .AllowedOAuthFlowsUserPoolClient = true
    ' > "$TEMP_DIR/app-client-update.json"

aws cognito-idp update-user-pool-client \
  --region "$AWS_REGION" \
  --cli-input-json "file://$TEMP_DIR/app-client-update.json" >/dev/null

echo "Cognito email, OAuth domain, Google provider, and app client configured."
