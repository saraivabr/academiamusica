#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"

aws dynamodb scan \
  --region "$AWS_REGION" \
  --table-name academia-musica-orders \
  --projection-expression "id,#status,#name,email,phone,#value,createdAt,paidAt" \
  --expression-attribute-names '{"#status":"status","#name":"name","#value":"value"}' \
  --output json |
  jq -r '
    ["STATUS","VALOR","CLIENTE","E-MAIL","WHATSAPP","CRIADO","PAGO","PEDIDO"],
    (.Items | sort_by(.createdAt.S) | reverse[] | [
      .status.S,
      ((.value.N | tonumber) / 100 | tostring),
      .name.S,
      .email.S,
      (.phone.S // "-"),
      .createdAt.S,
      (.paidAt.S // "-"),
      .id.S
    ]) | @tsv
  ' | column -t -s $'\t'
