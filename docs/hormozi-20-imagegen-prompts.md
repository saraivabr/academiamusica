# Prompts finais de ImageGen — Oferta V2

Modo utilizado: ImageGen integrado do Codex, sem CLI e sem chave de API.

Referências visuais:

- `public/ads/offer-v2-imagegen/01-reacao-9x16.png`
- `public/ads/offer-v2-imagegen/02-frase-ao-play-9x16.png`
- `public/ads/offer-v2-imagegen/03-oferta-direta-9x16.png`

## Prompt mestre

```text
Use case: photorealistic-natural, product-mockup, ui-mockup ou
infographic-diagram, conforme a campanha.
Asset type: Meta Ads vertical campaign creative, 9:16.
Input image: visual style reference only; create a new scene and composition
unless the request is explicitly an edit.
Style/medium: premium editorial advertising, emotionally authentic,
production-ready.
Composition/framing: small green waveform-style musicacom.ia mark centered at
top; large high-contrast headline; one visual idea; one CTA near the bottom
inside safe margins.
Color palette: deep emerald green, cream, warm amber and a restrained coral
accent.
Typography: bold modern sans-serif, correct Portuguese accents.
Constraints: render the supplied overlay text verbatim; no extra claims; no
external logos; no watermark; no fake testimonial; no fake scarcity; no
promise of a free complete song; no implication that 20 credits equal 20
songs.
```

## Variações por campanha

| ID | Cena ou mecanismo | Texto no criativo |
| --- | --- | --- |
| C01 | Mãe e filha adultas dividindo um fone em casa | “A história dela virou música.” / “Crie uma prévia grátis.” / “Começar agora” |
| C02 | Casal revendo uma foto antiga e dividindo o fone | “A música que só vocês entendem.” / “Prévia criativa grátis.” / “Contar nossa história” |
| C03 | Aniversariante abre caixa verde e recebe o fone | “Um presente que pode ser ouvido.” / “Transforme lembranças em música.” / “Criar presente” |
| C04 | Avô e neto folheando álbum e ouvindo juntos | “Algumas histórias merecem continuar tocando.” / “Uma homenagem feita de histórias reais.” / “Começar homenagem” |
| C05 | Casal lendo votos manuscritos | “Seus votos ganharam melodia.” / “Comece pela prévia criativa.” / “Criar direção” |
| C06 | Celular com quatro cartões de prévia, sem player | “Você não precisa comprar no escuro.” / “Veja a direção antes de pagar.” / “Ver minha prévia” |
| C07 | Cartões Emocionante, Romântica e Divertida | “Você escolhe o sentimento.” / “A história continua sendo sua.” / “Escolher o clima” |
| C08 | Uma história alimentando Versão A e Versão B | “Uma história. Até duas versões por rodada.” / “Ouça mais de um caminho.” / “Conhecer a oferta” |
| C09 | Fluxo História → Prévia textual → Pix → Play | “Da história ao play.” / “Um processo simples e guiado.” / “Começar agora” |
| C10 | Celular com biblioteca, player, capas e download | “Ouça, guarde e baixe.” / “Sua história na sua biblioteca.” / “Ver como funciona” |
| C11 | Texto escrito entrando em um player | “De uma frase ao play.” / “Sua história pode virar música.” / “Fazer minha prévia” |
| C12 | Três cartões de lembranças sobre uma mesa | “Comece com três lembranças.” / “O processo guia você.” / “Escrever lembranças” |
| C13 | Celular com perguntas simples e chips de resposta | “Sem prompt complicado.” / “Você conta. A plataforma conduz.” / “Iniciar processo” |
| C14 | Kit com música, capa, biblioteca, download e tutorial | “Música, capa, biblioteca e download.” / “Tudo no mesmo projeto.” / “Criar meu projeto” |
| C15 | Pix dentro do celular, QR decorativo e campo copia e cola | “O Pix aparece aqui mesmo.” / “Sem sair da musicacom.ia.” / “Fazer minha prévia” |
| C16 | Caneca e perfume desfocados; história e fone em primeiro plano | “Outra caneca? Outro perfume?” / “Dê uma história, não só uma coisa.” / “Criar presente” |
| C17 | Presente musical com quadro correto da oferta | “Um presente que ninguém esquece.” / “Projeto Música Presente · R$ 49,97” / “20 créditos · 10 rodadas · Até 2 versões por rodada” / “Criar prévia grátis” |
| C18 | Calendário de sete dias e cartão de prévia textual | “Prévia primeiro. Garantia depois.” / “7 dias a partir da confirmação da compra.” / “Conhecer a oferta” |
| C19 | Carteira de créditos ligada a ocasiões futuras | “Você não precisa usar tudo hoje.” / “Créditos sem validade.” / “Criar no meu ritmo” |
| C20 | Crédito sai, encontra falha técnica e retorna ao saldo | “Falha técnica? O crédito volta.” / “Seu saldo é protegido.” / “Ver como funciona” |

## Correções aplicadas

### C09

```text
Change only step 2 labeled “Prévia”. Replace play buttons and audio waveforms
with four text-only cards labeled “Título”, “Refrão”, “Emoção”, “Estilo”.
Keep the final player only in step 4.
```

### C15

```text
Keep the layout and simplify only the phone screen. Remove “Pagamento 100%
seguro”, “A confirmação é automática” and provider-like symbols. Keep only
“Pix”, a decorative nonfunctional QR placeholder and a blank copy-and-paste
field.
```

### C18

```text
Change only the preview card. Replace the waveform, play button and progress
bar with the four text-only rows “Título”, “Refrão”, “Emoção”, “Estilo”.
Preserve the seven-day guarantee line and all other elements.
```
