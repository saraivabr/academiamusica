#!/usr/bin/env bash
set -euo pipefail

BUCKET_NAME="${BUCKET_NAME:-academia-musica-ia-880690593918}"
DISTRIBUTION_ID="${DISTRIBUTION_ID:-E7L2G8OQTXQNS}"

./node_modules/.bin/next build

# Os criativos de campanha em public/ads/ ficam fora do deploy do site: são
# 122 MB que nenhuma página referencia. O --exclude também protege do --delete,
# então os anúncios já publicados continuam servidos pela CDN.
# Para publicar um criativo novo: npm run deploy:ads
aws s3 sync out "s3://${BUCKET_NAME}" \
  --delete \
  --exclude "ads/*" \
  --cache-control "public,max-age=0,must-revalidate" \
  --only-show-errors

aws s3 cp out/_next/static "s3://${BUCKET_NAME}/_next/static" \
  --recursive \
  --cache-control "public,max-age=31536000,immutable" \
  --only-show-errors

aws s3 cp out "s3://${BUCKET_NAME}" \
  --recursive \
  --exclude "*" \
  --exclude "ads/*" \
  --include "*.webp" \
  --include "*.png" \
  --include "*.jpg" \
  --include "*.jpeg" \
  --include "*.svg" \
  --include "*.mp3" \
  --cache-control "public,max-age=86400,stale-while-revalidate=604800" \
  --only-show-errors

bash infra/enable-static-routing.sh >/dev/null

INVALIDATION_ID="$(aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" \
  --query Invalidation.Id \
  --output text)"

aws cloudfront wait invalidation-completed \
  --distribution-id "$DISTRIBUTION_ID" \
  --id "$INVALIDATION_ID"
aws cloudfront wait distribution-deployed --id "$DISTRIBUTION_ID"

echo "Publicado em https://musicacom.ia.br"
