#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
DAYS="${1:-14}"

if date -u -v-"${DAYS}"d "+%Y-%m-%dT%H:%M:%S.000Z" >/dev/null 2>&1; then
  SINCE="$(date -u -v-"${DAYS}"d "+%Y-%m-%dT%H:%M:%S.000Z")"
else
  SINCE="$(date -u -d "${DAYS} days ago" "+%Y-%m-%dT%H:%M:%S.000Z")"
fi

aws dynamodb scan \
  --region "$AWS_REGION" \
  --table-name academia-musica-events \
  --projection-expression "id,#eventName,sessionId,#source,#value,createdAt,#placement,#journey,#step,#outcome,#product" \
  --filter-expression "createdAt >= :since" \
  --expression-attribute-names '{"#eventName":"name","#source":"source","#value":"value","#placement":"placement","#journey":"journey","#step":"step","#outcome":"outcome","#product":"product"}' \
  --expression-attribute-values "{\":since\":{\"S\":\"${SINCE}\"}}" \
  --output json |
  node infra/funnel-report.mjs "$DAYS"
