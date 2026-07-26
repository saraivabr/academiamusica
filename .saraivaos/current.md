# SaraivaOS — Estado atual

Atualizado em: 2026-07-26T10:29:00.381Z

## Projeto

- Nome: Academia Música IA
- Objetivo: Transformar o site em um sistema comercial mensurável que converte visitas em pagamentos e pagamentos em acesso entregue
- Etapa: validacao
- Rota: Coletar baseline real antes de alterar promessa, preço ou arquitetura
- Próximo artefato: Decisão sobre o maior vazamento do funil com 100 sessões ou 14 dias
- Bloqueio: Nenhum

## Evidências

- Observadas: 5
- Fornecidas: 0
- Inferidas: 0
- Hipóteses: 0
- Desconhecidas: 1

## Métodos ativos

- First Principles
- Jobs/minimalismo

## Ações pendentes

- [ ] Conduzir 100 sessões qualificadas ao funil comercial — responsável: Saraiva — prazo: 2026-08-09 — métrica: visita para checkout, checkout para Pix e Pix para pagamento por origem

## Experimentos ativos

- exp-20260726101711-c93bfb9d: Baseline do funil comercial — métrica: taxa entre landing_view, checkout_view, pix_created e purchase_confirmed

## Artefatos

- coletor first-party: app/lib/analytics.ts — prova: landing_view, CTA, checkout e atribuição por sessão validados no domínio público
- telemetria confiável de receita: infra/checkout/index.mjs — prova: pix_created gravado pelo backend após cobrança Woovi real
- painel operacional: infra/funnel.sh — prova: npm run funnel executado contra DynamoDB e retornou baseline limpo

## Aprendizados recentes

- A próxima melhoria comercial deve ser escolhida pelos dados do funil, não por preferência estética — evidência: exp-20260726101711-c93bfb9d e prova live do funil até Pix
