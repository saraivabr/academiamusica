#!/usr/bin/env bash
set -euo pipefail

# Publica apenas os criativos de campanha (public/ads/), que ficam fora do
# deploy do site. Rode depois de adicionar ou trocar uma arte de anúncio.

BUCKET_NAME="${BUCKET_NAME:-academia-musica-ia-880690593918}"
DISTRIBUTION_ID="${DISTRIBUTION_ID:-E7L2G8OQTXQNS}"

aws s3 sync public/ads "s3://${BUCKET_NAME}/ads" \
  --cache-control "public,max-age=604800" \
  --only-show-errors

aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/ads/*" \
  --query Invalidation.Id \
  --output text
