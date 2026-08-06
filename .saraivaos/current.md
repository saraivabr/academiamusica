# SaraivaOS — Estado atual

Atualizado em: 2026-07-30T17:19:03.552Z

## Projeto

- Nome: musicacom.ia
- Objetivo: Transformar o site em um sistema comercial mensurável que converte visitas em pagamentos e pagamentos em acesso entregue
- Etapa: aprendizado
- Rota: Manter a criação guiada brasileira como assimetria e transformar cada áudio entregue em um projeto contínuo: escolher versão, ouvir no player, criar capa, baixar ou gerar nova interpretação.
- Próximo artefato: Medir escolha de versão e avanço para capa nas próximas 100 sessões válidas
- Bloqueio: Nenhum

## Evidências

- Observadas: 25
- Fornecidas: 3
- Inferidas: 0
- Hipóteses: 0
- Desconhecidas: 2

## Métodos ativos

- saraiva-os
- first-principles
- jobs-minimalismo
- tdd

## Ações pendentes

- [ ] Conduzir 100 sessões qualificadas ao funil comercial — responsável: Saraiva — prazo: 2026-08-09 — métrica: visita para checkout, checkout para Pix e Pix para pagamento por origem
- [ ] Substituir chat pelo Criador Express — responsável: Saraiva — prazo: 2026-07-27 — métrica: tempo até confirmação da primeira geração
- [ ] Validar landing e checkout contra nova oferta por créditos — responsável: Saraiva — prazo: 2026-07-28 — métrica: ausência de preço ou promessa divergente entre landing, checkout e backend
- [ ] Medir diariamente a Rota Única até 100 sessões válidas — responsável: Codex heartbeat — prazo: não definido — métrica: music_route_unique_confirmed / music_route_unique_opened; inválidos <=5%
- [ ] Publicar Oferta V2 em janela controlada e executar smoke test de compra — responsável: Saraiva + Codex — prazo: 2026-07-30 — métrica: landing, prévia, Pix, pagamento, acesso e saldo de 20 créditos funcionando no domínio público
- [ ] Coletar 30 sessões por variante da mensagem da home — responsável: Codex + tráfego do site — prazo: não definido — métrica: story_started / landing_view por variante; Pix e compra como guardrails

## Experimentos ativos

- exp-20260726101711-c93bfb9d: Baseline do funil comercial — métrica: taxa entre landing_view, checkout_view, pix_created e purchase_confirmed
- exp-20260726180301-922371d8: Criador Express versus conversa — métrica: taxa de abertura do criador até music_generation_confirmed
- exp-20260728002930-3c5ba83f: Rota Única: abertura até música entregue — métrica: sessões válidas com music_route_unique_confirmed vinculadas / sessões válidas com music_route_unique_opened, nas primeiras 100 sessões
- exp-20260730151212-09a3d23f: Resultado como projeto contínuo — métrica: music_next_step_selected cover dividido por music_generation_delivered
- exp-20260730171903-041e9d51: Mensagem da home: história versus presente versus lembrança — métrica: story_started dividido por landing_view, por variante, com Pix e compra como guardrails

## Artefatos

- coletor first-party: app/lib/analytics.ts — prova: landing_view, CTA, checkout e atribuição por sessão validados no domínio público
- telemetria confiável de receita: infra/checkout/index.mjs — prova: pix_created gravado pelo backend após cobrança Woovi real
- painel operacional: infra/funnel.sh — prova: npm run funnel executado contra DynamoDB e retornou baseline limpo
- product: app/biblioteca/gerador/page.tsx — prova: Criador Express renderizado; teste automatizado confirma ausência do estúdio conversacional
- blueprint: .saraivaos/artifacts/platform-v2-blueprint.md — prova: Sinais, rota, backlog, carteira e experimento documentados
- isolamento de workspace: app/lib/accountWorkspace.js — prova: Teste comportamental preserva a mesma conta e limpa troca de conta ou logout
- sistema de marca: docs/brand-system.md — prova: tokens, regras de uso e kit de ativos implementados
- relatório multimodal: .saraivaos/artifacts/brand-refresh-2026-07-28.md — prova: comparação visual e screenshots locais de landing, login, academia e QG Ads
- blueprint: docs/saraivaos-plano-oferta-v2.md — prova: Plano inspecionado com sinais, rota, arquitetura, fases, testes, critérios de aceite e experimento de R$ 500
- product: app/preview/page.tsx — prova: Prévia criativa sem áudio implementada e validada em desktop e mobile
- proof: tests/offer-v2-contract.test.mjs — prova: Contrato Oferta V2, transição legada e devolução idempotente de créditos cobertos por testes
- product-loop: app/biblioteca/gerador/page.tsx — prova: Seleção explícita de versão, player persistente e painel de continuidade com capa, download e nova interpretação; build validado e 42 testes aprovados.
- motor de experimentos de conversão: app/lib/conversionExperiment.ts — prova: três variantes persistentes, atribuição até pagamento, build validado e 48 testes aprovados

## Aprendizados recentes

- A próxima melhoria comercial deve ser escolhida pelos dados do funil, não por preferência estética — evidência: exp-20260726101711-c93bfb9d e prova live do funil até Pix
- A direção musical estruturada pode ser enviada diretamente ao endpoint de geração; o chat é uma camada opcional de interface, não uma dependência do motor — evidência: auditoria de app/biblioteca/gerador/page.tsx e build validado
- Quando a entrada já reduz complexidade melhor que os líderes, a maior alavanca não é adicionar controles; é tornar explícita a continuidade após o primeiro resultado. — evidência: Suno e Udio usam player, versões e remix para retenção; musicacom.ia já vence na direção guiada em português e ganhou um loop pós-geração mensurável.
