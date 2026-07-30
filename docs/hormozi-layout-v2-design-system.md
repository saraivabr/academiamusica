# Direção visual V2 — Projeto Música Presente

Data: 30 de julho de 2026

## Resultado

A V2 substitui o aspecto de template gerado por IA por um sistema de campanha
mais editorial, consistente e regenerável.

Prancha:

`public/ads/hormozi-v2-20/layout-v2/contact-sheet-v2.jpg`

Finais:

`public/ads/hormozi-v2-20/layout-v2/final/`

Fundos originais:

`public/ads/hormozi-v2-20/layout-v2/backgrounds/`

Renderizador:

`scripts/render-hormozi-layout-v2.mjs`

## O que mudou

- texto gerado por IA foi substituído por tipografia real;
- marca oficial foi aplicada a partir dos arquivos do projeto;
- headlines foram encurtadas e ganharam mais espaço;
- os botões grandes e artificiais foram removidos;
- os CTAs viraram assinaturas discretas, complementares ao botão da Meta;
- os mockups de celular repetidos foram substituídos por diagramas editoriais;
- a coleção ganhou três famílias, sem perder unidade;
- as informações comerciais permanecem fora da área crítica inferior;
- nenhum arquivo anterior foi sobrescrito.

## Famílias de layout

### Editorial emocional

Campanhas: C01, C02, C03, C04, C05, C11, C12 e C16.

- fotografia sem texto criada no ImageGen;
- pessoas e objetos concentrados no terço inferior;
- espaço negativo real para headline;
- gradiente de contraste aplicado no render;
- tipografia e marca compostas posteriormente.

### Produto minimalista

Campanhas: C06, C08, C10, C14, C15, C17 e C18.

- fundo claro ou cor de alta interrupção;
- cards funcionais e poucos elementos;
- números e mecanismo como protagonistas;
- nenhuma interface externa inventada;
- prévia representada somente por título, refrão, emoção e estilo.

### Sistema editorial escuro

Campanhas: C07, C09, C13, C19 e C20.

- fundo verde profundo;
- contraste alto e detalhe verde vivo;
- diagramas simples, sem estética de painel;
- coral usado apenas para diferença, falha ou atenção.

## Sistema visual

- canvas: 1080 × 1920;
- formato: PNG 9:16;
- verde profundo: `#062F27`;
- verde vivo: `#00D784`;
- creme: `#F4EFE5`;
- papel: `#FBF8F1`;
- coral: `#FF725C`;
- âmbar: `#E5A24B`;
- tipografia: Arial/Helvetica sans-serif na renderização SVG;
- marca: `public/brand/musicacom-logo-horizontal*.png`;
- margem lateral principal: 72 px;
- CTA elevado para terminar antes da zona inferior de interface.

## Prompts finais dos fundos

Modo: ImageGen integrado do Codex.

Prompt mestre:

```text
Use case: ads-marketing.
Asset type: text-free cinematic background for a premium Meta ad, portrait
9:16.
Style/medium: premium editorial campaign photography, candid,
photorealistic, real skin and material texture, subtle film character.
Composition/framing: subjects and objects concentrated in the lower half,
with generous quiet negative space in the upper-left and top third for later
typography.
Color palette: warm amber, cream and deep green accents.
Constraints: absolutely no text, no letters, no logo, no watermark, no
interface, no graphic overlays and no staged stock-photo expression.
```

Variações:

- C01: mãe e filha adultas dividindo um fone em casa;
- C02: casal revendo uma foto de viagem ao entardecer;
- C03: abertura de presente com fone em caixa verde;
- C04: avô e neto folheando álbum e ouvindo juntos;
- C05: casal lendo votos manuscritos em ambiente claro;
- C11: pessoa escrevendo três lembranças em cartões;
- C12: três cartões com símbolos de lugar, frase e afeto;
- C16: amigas ouvindo enquanto reveem fotografias.

Os demais fundos e componentes são vetoriais e determinísticos. Isso evita
texto incorreto, QR Code funcional acidental, interfaces falsas e inconsistência
de alinhamento.

## Regeneração

```bash
node scripts/render-hormozi-layout-v2.mjs
```

O script gera os 20 arquivos finais sem tocar na primeira versão.

## Ordem recomendada de teste

1. `c16-outro-perfume-layout-v2-9x16.png`
2. `c01-historia-da-mae-layout-v2-9x16.png`
3. `c06-previa-antes-de-pagar-layout-v2-9x16.png`
4. `c11-nao-precisa-cantar-layout-v2-9x16.png`
5. `c17-oferta-direta-layout-v2-9x16.png`

Essa ordem mantém os cinco ângulos da estratégia anterior: contraste, emoção,
reversão de risco, redução de esforço e oferta direta.
