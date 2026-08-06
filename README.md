# musicacom.ia

Plataforma brasileira para transformar uma história em música: prévia criativa
grátis, pagamento único via Pix e criação guiada dentro da área de membros.

Produção: <https://musicacom.ia.br>

## Oferta

`music_present_v1` — **Projeto Música Presente, R$ 49,97 via Pix**:
20 créditos musicais = 10 rodadas pagas, com até 2 versões por rodada.

A prévia criativa (`/preview`) entrega título, refrão, emoção e direção musical
sem consumir crédito e sem gerar áudio. O áudio completo só existe após o
pagamento.

## Arquitetura

O site é um export estático do Next.js publicado em S3 + CloudFront. Todo o
backend é uma Lambda única atrás do API Gateway.

```text
Next (output: export) ──> S3 ──> CloudFront ──> musicacom.ia.br
                                      │
                                      └── CloudFront Function valida o cookie
                                          assinado em /academia e /biblioteca

Browser ──> API Gateway ──> Lambda (infra/checkout/index.mjs)
                              ├── Woovi ......... Pix avulso e Pix Automático
                              ├── Cognito ....... conta, e-mail e Google (PKCE)
                              ├── Suno .......... geração musical
                              ├── Apify ......... prospecção de negócios
                              ├── S3 + proxy .... criação de capas
                              ├── SES ........... e-mail de música pronta
                              └── DynamoDB ...... pedidos e eventos
```

- `app/` — rotas públicas e área de membros
- `infra/checkout/index.mjs` — a API inteira
- `infra/image-proxy/` — Worker Cloudflare que fala com o motor de imagem
- `tests/` — contratos de preço/oferta em Node e jornadas em Playwright

Segredos vivem em `/academia-musica/prod/` no SSM e nunca no repositório.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | gera o export estático em `out/` |
| `npm test` | build + contratos de preço, oferta e HTML publicado |
| `npm run test:e2e` | jornadas em desktop e celular sobre o `out/` |
| `npm run lint` | ESLint |
| `npm run deploy:aws` | publica o site e invalida a CDN |
| `npm run deploy:checkout` | atualiza a Lambda, a API e as permissões |
| `npm run orders` | lista pedidos e pagamentos |
| `npm run funnel` | funil dos últimos 14 dias, por origem |

O E2E sobe um servidor estático que reproduz a regra de roteamento da
CloudFront Function, então testa o mesmo artefato que vai a produção.
