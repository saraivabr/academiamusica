# SaraivaOS — Estado atual

Atualizado em: 2026-07-28T00:07:31.328Z

## Projeto

- Nome: musicacom.ia
- Objetivo: Transformar o site em um sistema comercial mensurável que converte visitas em pagamentos e pagamentos em acesso entregue
- Etapa: validacao
- Rota: Rota Única validada localmente; preparar publicação e medir ativação
- Próximo artefato: Deploy produtivo da Rota Única com baseline de conclusão por etapa
- Bloqueio: Publicação em produção ainda não executada nesta rodada

## Evidências

- Observadas: 11
- Fornecidas: 2
- Inferidas: 0
- Hipóteses: 0
- Desconhecidas: 2

## Métodos ativos

- Jobs/minimalismo
- First Principles
- HyperFrames

## Ações pendentes

- [ ] Conduzir 100 sessões qualificadas ao funil comercial — responsável: Saraiva — prazo: 2026-08-09 — métrica: visita para checkout, checkout para Pix e Pix para pagamento por origem
- [ ] Substituir chat pelo Criador Express — responsável: Saraiva — prazo: 2026-07-27 — métrica: tempo até confirmação da primeira geração
- [ ] Validar landing e checkout contra nova oferta por créditos — responsável: Saraiva — prazo: 2026-07-28 — métrica: ausência de preço ou promessa divergente entre landing, checkout e backend

## Experimentos ativos

- exp-20260726101711-c93bfb9d: Baseline do funil comercial — métrica: taxa entre landing_view, checkout_view, pix_created e purchase_confirmed
- exp-20260726180301-922371d8: Criador Express versus conversa — métrica: taxa de abertura do criador até music_generation_confirmed

## Artefatos

- coletor first-party: app/lib/analytics.ts — prova: landing_view, CTA, checkout e atribuição por sessão validados no domínio público
- telemetria confiável de receita: infra/checkout/index.mjs — prova: pix_created gravado pelo backend após cobrança Woovi real
- painel operacional: infra/funnel.sh — prova: npm run funnel executado contra DynamoDB e retornou baseline limpo
- product: app/biblioteca/gerador/page.tsx — prova: Criador Express renderizado; teste automatizado confirma ausência do estúdio conversacional
- blueprint: .saraivaos/artifacts/platform-v2-blueprint.md — prova: Sinais, rota, backlog, carteira e experimento documentados
- isolamento de workspace: app/lib/accountWorkspace.js — prova: Teste comportamental preserva a mesma conta e limpa troca de conta ou logout

## Aprendizados recentes

- A próxima melhoria comercial deve ser escolhida pelos dados do funil, não por preferência estética — evidência: exp-20260726101711-c93bfb9d e prova live do funil até Pix
- A direção musical estruturada pode ser enviada diretamente ao endpoint de geração; o chat é uma camada opcional de interface, não uma dependência do motor — evidência: auditoria de app/biblioteca/gerador/page.tsx e build validado
