# Atualização de identidade — musicacom.ia

Data: 2026-07-28

## Contrato SARAIVA

- Sinal: o produto ainda usava marcas genéricas e variações antigas de verde em superfícies públicas e autenticadas.
- Aposta: tornar o símbolo de onda e a assinatura `musicacom.ia` a fonte visual única aumenta reconhecimento e consistência sem alterar o funil comercial.
- Rota: landing, login, academia, biblioteca, checkout, e-mail, PWA, social/OG e QG Ads.
- Artefatos: kit de marca em `public/brand/`, componente `BrandLogo`, tokens documentados e artes social/story/OG.
- Instrumento: comparação visual entre o logo fornecido e a implementação, builds e testes automatizados.
- Verdade observada: as superfícies locais renderizam a nova identidade em desktop e mobile; publicação não foi realizada nesta etapa.
- Ação: manter a identidade como base visual e medir o funil já instrumentado sem misturar mudança estética com resultado comercial.

## Sistema visual aplicado

- Pulse Green: `#04E688`
- Pulse Deep: `#02DB79`
- Onyx: `#151923`
- Warm White: `#F8FBF9`
- Soft Mint: `#A1F4D6`

## Provas

- `05-after-landing-desktop.png`
- `06-logo-vs-desktop-comparison.png`
- `07-after-landing-mobile.png`
- `08-after-login-mobile.png`
- `09-after-academy-desktop.png`
- `10-after-qg-ads-desktop.png`

As provas estão em `.saraivaos/proof/brand-audit-2026-07-28/`.

## Verificações

- `node --test tests/*.test.mjs`: 20 testes aprovados.
- `npm run build:aws`: build principal e TypeScript aprovados.
- `npm run build` em `qg-ads/`: build aprovado.
- `npm run lint`: zero erros; permanecem avisos não bloqueantes de `no-img-element`.
