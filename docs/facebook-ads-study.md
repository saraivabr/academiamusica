# Estudo SaraivaOS — Facebook e Instagram Ads

**Produto:** musicacom.ia

**Domínio:** https://musicacom.ia.br

**Data do estudo:** 27 de julho de 2026

**Status:** estratégia e preparação; nenhuma campanha publicada e nenhum orçamento ativado.

## Decisão executiva

A primeira campanha não deve vender “20 músicas por R$ 49,97” para público frio.
Ela deve vender a primeira transformação:

> **Conte uma ideia. Escute uma música sua. Grátis hoje.**

O anúncio leva à conta gratuita, a pessoa cria a primeira música e só depois
recebe a oferta de continuidade por Pix. O principal resultado da aquisição
será uma **conta confirmada que concluiu a primeira música**, não um clique e
nem somente um cadastro.

Há quatro motivos:

1. a entrada gratuita elimina a principal objeção antes de a pessoa conhecer a
   qualidade;
2. o produto é melhor demonstrado com áudio do que explicado;
3. a primeira criação revela intenção real e separa curiosidade de potencial
   comprador;
4. a margem e a recompra ainda não têm volume suficiente para definir um CAC
   de compra confiável.

## Revisão multiagente

O estudo foi revisado em paralelo por três agentes especializados:

| Frente | Pergunta | Conclusão |
| --- | --- | --- |
| Experiência comercial | Qual intenção possui desejo, prova e continuidade suficientes? | Homenagem deve abrir o funil; Jingle e Compositor devem validar monetização e recorrência. |
| Oferta e economia | Quanto podemos pagar para adquirir um usuário? | Ainda não existe CAC ou payback observável; o teto prudente de mídia permanece R$ 0 até medir margem e contribuição por coorte. |
| Mensuração e segurança | Conseguimos ligar anúncio, conta, música e Pix confirmado? | Ainda não. A atribuição não chega à conta gratuita, faltam eventos de cadastro e primeira música, e não existe CAPI server-side. |

### Consenso operacional

1. **Não publicar mídia ainda.**
2. Corrigir a ligação
   `criativo → cadastro confirmado → primeira música → compra`.
3. Produzir prova real para Homenagem, Jingle e Compositor.
4. Testar essas três intenções organicamente em condições comparáveis.
5. Liberar mídia somente quando ativação, qualidade da entrega, custo variável e
   margem estiverem observáveis.

### Promessa consolidada

> **Conte sua história. Escute uma música feita a partir dela. Uma grátis por dia.**

“100% brasileirada” permanece como mecanismo de diferenciação — português,
ritmos, linguagem e contexto — mas não substitui a transformação principal.

## S.A.R.A.I.V.A.

### S — Sinais

#### Produto observado

- Conta gratuita, sem cartão.
- Uma música grátis por dia.
- Criação guiada, em português, sem exigir prompt técnico.
- Estilos brasileiros, biblioteca pessoal, player, download, criação de capa e
  tutorial integrado.
- Continuidade opcional por Pix:

| Oferta | Preço | Músicas comunicadas | Preço nominal por música |
| --- | ---: | ---: | ---: |
| Essencial | R$ 49,97 | 20 | R$ 2,50 |
| Criador | R$ 109,97 | 50 | R$ 2,20 |
| Estúdio | R$ 199,97 | 100 | R$ 2,00 |
| Clube Criador | R$ 99,97/mês | 60/mês | R$ 1,67 |

Os anúncios não devem explicar a mecânica interna de geração ou de saldo. A
promessa pública deve permanecer simples: a quantidade de músicas disponível
em cada oferta.

A função de cada degrau deve ser diferente:

1. **Grátis:** provar que a ideia consegue virar música.
2. **Essencial:** permitir continuar criando hoje, sem esperar o benefício do
   dia seguinte.
3. **Clube:** atender quem já demonstrou frequência e quer melhor custo mensal.

O Clube não deve ser a promessa para público frio. Além de exigir mais confiança
e dados de cobrança, ele possui preço unitário inferior ao pacote Criador e pode
dominar a escolha antes de a recorrência estar comprovada. O selo “MAIS
ESCOLHIDO” do pacote Criador também não representa prova observada enquanto não
existirem compras.

#### Funil observado nos últimos 30 dias

Leitura feita no banco de eventos da produção em 27/07/2026:

| Sinal | Sessões únicas | Leitura |
| --- | ---: | --- |
| Visitas à landing | 26 | topo do funil ainda pequeno |
| Cliques no CTA | 4 | 15,4% das sessões da landing |
| Aberturas do login | 13 | inclui entradas diretas e outras origens |
| Criador aberto | 2 | ativação ainda não atribuída |
| Música concluída | 1 | três conclusões, todas da mesma sessão proprietária |
| Recarga criada | 1 | intenção, não receita |
| Pix criado | 1 | cobrança pendente |
| Compra confirmada | 0 | R$ 0 de receita confirmada |

Também foram registradas 10 visitas com referência de Facebook, sem compra
confirmada. Isso **não prova campanha paga nem desempenho de anúncio**; prova
somente a origem referenciadora informada pelo navegador.

O volume ainda é insuficiente para benchmark. A própria rotina atual considera
um baseline mínimo de 100 sessões ou 14 dias, e a jornada registrada mistura o
checkout antigo com o novo fluxo gratuito. Passar 14 dias, sozinho, não resolve
a ausência de eventos canônicos em cada etapa.

#### Mensuração observada

- `utm_source`, `utm_medium` e `utm_campaign` são preservados apenas no
  dispositivo e chegam aos eventos anônimos do funil.
- `utm_content`, `utm_term`, `fbclid`, `_fbp` e `_fbc` não são preservados.
- Uma atribuição antiga armazenada prevalece sobre uma visita posterior; não
  existe separação entre first-touch e last-non-direct.
- A troca autenticada do Cognito envia somente token e identificador de
  dispositivo. A conta gratuita nasce sem sessão, campanha, origem ou
  consentimento Meta.
- O backend registra criação musical concluída e compra confirmada.
- Existe código para inicializar o Pixel e chamar `PageView` após consentimento,
  mas isso ainda precisa ser confirmado ao vivo no Events Manager.
- O caminho gratuito atual não envia `CompleteRegistration` à Meta.
- Não existem eventos próprios de cadastro iniciado ou confirmado.
- `music_generation_completed` mede qualquer música; não existe marcador
  idempotente de primeira música por conta.
- Recargas e assinaturas confirmadas pelo backend não estão ligadas à
  Conversions API da Meta.
- O `Purchase` no navegador pertence ao caminho antigo de confirmação e não é
  a fonte mais confiável para as compras atuais dentro da plataforma.
- O identificador chamado de sessão não expira; na prática, representa um
  navegador persistente.

Conclusão: a plataforma consegue auditar a jornada internamente, mas ainda não
deve otimizar mídia por compra até que o caminho gratuito e o Pix confirmado
estejam corretamente conectados ao dataset da Meta.

### A — Assimetria

As páginas concorrentes observadas concentram a mensagem em:

- criação em segundos;
- muitos gêneros;
- ausência de conhecimento musical;
- planos gratuitos e assinaturas;
- uso comercial, MP3/WAV e quantidade.

Isso transforma “gerador de música com IA” em categoria comparável por preço e
volume. A oportunidade da Academia é ocupar outro território:

> **A plataforma brasileira onde uma história, uma homenagem ou uma ideia de
> negócio ganha voz, capa e lugar no seu repertório.**

#### Vantagens que podem ser demonstradas

- A experiência é brasileira na linguagem, nos ritmos e nos exemplos.
- A pessoa não precisa aprender a escrever prompt.
- O resultado não termina em um arquivo solto: vai para repertório, player e
  capa.
- O valor aparece antes da compra.
- Pix reduz atrito para quem decide continuar.

#### Risco de posicionamento

Existe resistência pública a conteúdo musical gerado automaticamente quando a
comunicação sugere atalho, spam ou substituição do artista. Portanto:

- não prometer “fique rico com música”;
- não sugerir fraude de streaming;
- não imitar artista vivo;
- não usar depoimentos, números ou faixas inventadas;
- enquadrar a plataforma como ferramenta para transformar a **ideia da
  pessoa** em uma criação que ela orienta.

### R — Rota

#### Público prioritário por trabalho a realizar

| Prioridade | Trabalho a realizar | Momento de compra | Promessa | Por que testar |
| --- | --- | --- | --- | --- |
| 1 | Presentear ou homenagear alguém | aniversário, casamento, namoro, família, memória | “Transforme uma história de vocês em música” | intenção emocional imediata, demonstração forte e fácil de compartilhar |
| 2 | Criar um jingle ou identidade sonora | lançamento, promoção, comércio local, conteúdo | “Faça seu negócio ser lembrado pelo som” | dor econômica clara e maior disposição a pagar |
| 3 | Tirar uma composição da cabeça | compositor iniciante, cantor, produtor independente | “Sua ideia não precisa ficar no bloco de notas” | recorrência potencial e bom encaixe com repertório |
| 4 | Criar trilha para conteúdo | Reels, podcast, YouTube, evento | “Seu conteúdo com um som que nasceu para ele” | volume e recorrência, mas exige clareza sobre direitos de uso |
| 5 | Explorar ritmos por diversão | curiosidade e entretenimento | “Hoje sua ideia pode virar forró, trap ou sertanejo” | bom alcance, porém maior risco de atrair apenas gratuidade |

Não começar com cinco conjuntos de anúncios. A intenção será identificada pelo
**criativo** dentro de uma audiência ampla; isso evita fragmentar um orçamento
pequeno.

#### Público inicial recomendado

- Brasil.
- 18 anos ou mais.
- Português.
- Audiência ampla com Advantage+.
- Exclusão de contas confirmadas e compradores, quando as listas forem
  suficientes e estiverem disponíveis com base legal.
- Interesses podem entrar como sugestão, não como uma cerca rígida.

Lookalike fica para depois de existir uma base limpa de compradores ou usuários
ativados. Visitantes e cadastros sem música criada não são semente de alta
qualidade.

#### Objetivo recomendado

Depois de instrumentar os eventos, usar:

- **Campanha de Vendas**;
- local de conversão: site;
- evento inicial de otimização: `CompleteRegistration`;
- migração para o evento de primeira música quando ele acumular volume
  suficiente e estiver disponível como conversão personalizada;
- migração final para `Purchase` apenas quando compras verificadas forem
  frequentes o bastante para aprendizagem.

A Meta informa que o objetivo de Vendas pode otimizar para eventos do site como
registro e checkout. Tráfego não é a escolha inicial porque o objetivo do
negócio é uma ação mensurável, não simplesmente visita.

### A — Arquitetura

#### Escada de conversão

```text
Impressão
  → visita qualificada
  → clique em “criar grátis”
  → cadastro iniciado
  → e-mail confirmado
  → criador aberto
  → primeira música concluída
  → retorno em até 7 dias
  → recarga Pix ou Clube
  → segunda compra ou renovação
```

#### Mapa de eventos proposto

| Momento | Evento Meta | Evento próprio | Origem confiável |
| --- | --- | --- | --- |
| Landing aberta | `PageView` | `landing_view` | navegador com consentimento |
| CTA gratuito | evento diagnóstico | `free_signup_cta` | navegador |
| Cadastro enviado | `Lead` opcional | `registration_started` | navegador/backend |
| Conta realmente criada | `CompleteRegistration` | `registration_confirmed` | backend, idempotente |
| Criador aberto | evento diagnóstico | `music_creator_opened` | navegador |
| Primeira música entregue | conversão personalizada sobre `FirstMusicCreated` | `first_music_created` | backend, marcador por conta |
| Checkout de créditos iniciado | `InitiateCheckout` | `credit_checkout_started` | navegador/backend |
| Pix criado | evento diagnóstico | `pix_created` | backend |
| Pix confirmado | `Purchase` | `purchase_confirmed` | backend/provedor |
| Assinatura paga | `Subscribe` ou `Purchase`, conforme taxonomia validada | `music_subscription_payment` | backend/provedor |

Regras:

- Pixel e Conversions API devem trabalhar juntos.
- Eventos enviados pelos dois caminhos precisam do mesmo `event_id` para
  deduplicação.
- Compra só é enviada após confirmação do provedor.
- Consentimento, política de privacidade e minimização de dados continuam
  valendo no servidor.
- A origem da campanha deve acompanhar a conta, não apenas o navegador.

#### Desenho mínimo da Conversions API

- Token guardado em SSM `SecureString`, com a Lambda autorizada somente para o
  parâmetro exato.
- Outbox assíncrona com `PENDING`, `SENT`, `FAILED`, tentativas e resposta
  sanitizada; a operação principal nunca depende da Meta responder.
- IDs determinísticos:
  - `registration_confirmed_<accountId>`;
  - `first_music_<accountId>`;
  - `purchase_<orderId>`;
  - `purchase_<hash(installmentId)>` para cada mensalidade efetivamente paga.
- Retry sempre reutiliza o mesmo `event_id`.
- E-mail normalizado com SHA-256; `_fbp` e `_fbc` somente quando houver
  consentimento.
- Nunca enviar CPF, endereço, história, prompt, letra, título ou conteúdo da
  música.
- Compra fica server-only na primeira versão. Se existir Pixel + CAPI para o
  mesmo evento, ambos precisam compartilhar exatamente o mesmo `event_id`.

#### Estrutura enxuta da campanha

```text
META_SALES_BR_FREE_DAILY_2026Q3
└── ADVANTAGE_BR_18PLUS_PROSPECTING
    ├── HOMENAGEM_UGC_15S_V1
    ├── IDEIA_VIRA_MUSICA_DEMO_20S_V1
    ├── JINGLE_NEGOCIO_DEMO_20S_V1
    ├── BRASIL_EM_RITMOS_MONTAGEM_15S_V1
    └── SEM_PROMPT_SCREENCAST_20S_V1
```

- Um conjunto de anúncios no início.
- Advantage+ Audience.
- Advantage+ Placements.
- Cinco anúncios com territórios realmente diferentes.
- Vídeo vertical 9:16, com áudio e elementos principais dentro da área segura.
- Legendas sempre, mesmo com a experiência desenhada para som.
- Feed pode receber adaptação 4:5.

Retargeting só ganha conjunto próprio quando houver volume suficiente para não
pulverizar entrega. Antes disso, excluir compradores e deixar a própria
campanha encontrar quem converte.

#### UTM padrão

```text
utm_source=meta
utm_medium=paid_social
utm_campaign=ami_sales_free_daily_2026q3
utm_content={territorio}_{formato}_{gancho}_v{versao}
```

Exemplo:

```text
https://musicacom.ia.br/?utm_source=meta&utm_medium=paid_social&utm_campaign=ami_sales_free_daily_2026q3&utm_content=homenagem_ugc_historia_v1
```

### I — Implementação

#### Território 1 — A história de vocês

**Ângulo SaraivaOS/Sexy Canvas:** afeto, memória e reconhecimento.

**Gancho visual:** uma mensagem real aparece na tela: “Pai, lembra daquela
viagem?”. Em seguida, o texto vira uma faixa tocando no player.

**Roteiro de 15 segundos:**

1. “Eu escrevi três linhas sobre o meu pai.”
2. Mostrar as escolhas rápidas na plataforma.
3. Tocar o trecho mais emocional do refrão.
4. “Transforme uma história de vocês em música.”
5. “Crie grátis hoje.”

**Texto principal:**

> Tem história que merece mais do que uma mensagem. Conte do seu jeito, escolha
> o clima e escute uma música feita a partir da sua ideia. Plataforma brasileira,
> sem cartão para começar.

**Headline:** Sua história pode virar música

**CTA:** Cadastre-se

#### Território 2 — Da frase ao play

**Ângulo:** prova de produto e curiosidade.

**Gancho:** tela dividida “antes: uma frase / depois: aperte o play”.

**Roteiro de 20 segundos:**

1. Digitar: “um forró sobre voltar para casa”.
2. Escolher emoção, ritmo e voz.
3. Mostrar a espera com progresso.
4. Tocar o resultado.
5. “Sem cantar. Sem tocar. Sem prompt.”

**Texto principal:**

> Você traz a ideia. A musicacom.ia ajuda a escolher a direção e transforma
> tudo em som. Tem uma criação grátis por dia.

**Headline:** Uma ideia. Uma música sua.

**CTA:** Cadastre-se

#### Território 3 — O som do seu negócio

**Ângulo Hormozi/Acquisition.com:** encurtar tempo e custo para chegar a uma
identidade sonora testável.

**Gancho:** comércio abrindo a porta enquanto um jingle curto cita a categoria
do negócio.

**Roteiro de 20 segundos:**

1. “Se sua marca tivesse um som, qual seria?”
2. Nome + oferta + estilo entram na criação.
3. Tocar um trecho curto.
4. Mostrar capa e player.
5. “Teste seu primeiro conceito grátis.”

**Texto principal:**

> Crie um primeiro conceito de jingle para Reels, WhatsApp, promoções e eventos.
> Você orienta a história e o estilo; a plataforma organiza a criação.

**Headline:** Faça sua marca ser lembrada

**CTA:** Saiba mais

Observação: só mencionar uso comercial quando os termos e a licença aplicável
estiverem documentados de forma explícita.

#### Território 4 — Brasil em estilos

**Ângulo:** identidade, pertencimento e variedade.

**Gancho:** a mesma frase muda de forró para trap, pagode, sertanejo e gospel.

**Roteiro de 15 segundos:**

1. “A mesma história pode soar de cinco jeitos.”
2. Cortes rápidos entre estilos.
3. Interface com escolhas brasileiras.
4. “Qual é o seu?”
5. “Crie grátis.”

**Texto principal:**

> Forró, trap, pagode, sertanejo, funk, gospel e outros ritmos do Brasil. Escolha
> a direção sem precisar escrever comando técnico.

**Headline:** Sua ideia com sotaque brasileiro

**CTA:** Cadastre-se

#### Território 5 — A música que não saiu do papel

**Ângulo:** autonomia criativa, sem desvalorizar músicos.

**Gancho:** bloco de notas cheio de frases; uma delas ganha refrão.

**Roteiro de 20 segundos:**

1. “Quantas músicas suas ainda estão só no bloco de notas?”
2. Colar ou resumir a ideia.
3. Escolher a energia.
4. Tocar o resultado.
5. “Tire a ideia do papel. Depois, faça do seu jeito.”

**Texto principal:**

> Use a plataforma para testar uma direção, ouvir possibilidades e construir
> repertório. A criação começa com você.

**Headline:** Tire sua música do papel

**CTA:** Cadastre-se

#### Regras criativas

- Usar áudio realmente criado e autorizado.
- Abrir com resultado ou conflito nos primeiros dois segundos.
- Mostrar a interface real, sem tela conceitual que o usuário não encontrará.
- Uma promessa por anúncio.
- Texto grande, legível e dentro da área segura.
- Não esconder espera; transformá-la em expectativa com progresso real.
- Não prometer prazo que a produção não cumpra de forma consistente.
- Não usar nomes, vozes, imagem ou estilo imitativo de artista sem autorização.
- Não declarar “profissional”, “royalty-free” ou “uso comercial” sem respaldo
  contratual claro.
- Não revelar mecânicas internas de créditos no anúncio; comunicar resultado,
  saldo disponível e preço de forma compreensível na oferta.

### V — Validação

#### Fase 0 — sem mídia paga

Objetivo: validar mensagem e capacidade de gerar cadastro ativado antes de
comprar alcance.

Duração: 7 a 14 dias.

1. Produzir três conceitos comparáveis:
   - Homenagem;
   - Jingle para pequeno negócio;
   - Composição que estava no bloco de notas.
2. Publicar organicamente em Reels, Facebook e Stories.
3. Usar UTMs por peça, mesmo no orgânico.
4. Medir:
   - retenção de 3 segundos;
   - conclusão do vídeo;
   - visitas ao perfil;
   - cliques no site;
   - cadastros confirmados;
   - primeira música concluída em até 24 horas.
5. Perguntar no cadastro ou após a primeira música: “O que você quer criar?”
   com opções curtas para confirmar o trabalho a realizar.

Usar dois placares:

```text
ativação = primeiras músicas / visitas atribuídas
```

```text
monetização = contribuição confirmada / usuários ativados
```

O vencedor não é o vídeo com mais visualizações. Homenagem pode ganhar em
ativação e perder em monetização; por isso os dois placares não podem ser
fundidos.

#### Fase 1 — mídia paga controlada

Pré-condições:

- `CompleteRegistration` validado no Events Manager;
- primeira música concluída identificável por origem;
- `Purchase` vindo do backend para recargas e Clube;
- mediana, p95 e taxa de sucesso da geração conhecidos;
- faixas e vídeos autorizados;
- custo variável por criação conhecido;
- margem de contribuição do Essencial conhecida;
- verba máxima do teste explicitamente aprovada.

Estrutura:

- uma campanha;
- um conjunto amplo;
- três a cinco anúncios;
- sete dias sem mudanças diárias, salvo erro, rejeição ou gasto de segurança;
- sem público semelhante e sem retargeting separado no primeiro ciclo.

O valor diário só deve ser definido depois do teto total aprovado. Sem verba
aprovada, a campanha permanece em rascunho.

#### Fase 2 — qualidade e monetização

Após acumular volume:

- desligar anúncios que trazem cadastro sem criação;
- separar Homenagem e Negócios se ambos tiverem volume;
- testar retargeting de conta confirmada sem primeira música;
- testar retargeting de usuário ativado sem compra;
- criar lookalike de compradores, não de visitantes;
- testar Clube apenas para usuários recorrentes, não como primeira promessa
  fria.

#### Métrica norte

```text
Custo por usuário ativado =
gasto em mídia / contas que concluíram a primeira música
```

Métricas de qualidade:

- `visita → cadastro confirmado`;
- `cadastro confirmado → primeira música em 24h`;
- `primeira música → retorno em 7 dias`;
- `primeira música → primeira compra em 7 e 14 dias`;
- `primeira compra → recompra ou mensalidade seguinte`;
- taxa de conta duplicada ou bloqueada;
- reembolso, suporte e falha de geração.

Métricas criativas:

- retenção nos primeiros 3 segundos;
- reprodução de 25%, 50% e 95%;
- CTR de saída;
- visualização da landing por clique;
- custo por cadastro confirmado;
- custo por primeira música.

#### Economia mínima antes de escalar

Não usar ROAS de plataforma como única verdade. Calcular:

```text
margem de contribuição da compra =
receita
- custo das gerações entregues
- taxa do Pix
- impostos
- provisão de reembolso e suporte
```

```text
CAC máximo de primeira compra =
margem de contribuição da primeira compra
x percentual de reinvestimento aprovado
```

```text
LTV de contribuição =
soma da margem de todas as compras do cliente
durante uma janela definida
```

Sem histórico de recompra, não antecipar LTV futuro para justificar prejuízo.
A campanha escala quando o CAC observado cabe na contribuição realizada, ou
quando existe uma coorte de recompra suficiente para sustentar a diferença.

Para o modelo atual, internamente:

```text
CMproduto =
preço
- (quantidade comunicada / 2 × custo real por geração paga)
- taxa Pix
- impostos
- reembolso
- suporte
- outros custos variáveis
```

Para aquisição gratuita:

```text
CPA máximo por ativado em W =
percentual de reinvestimento
× (
  contribuição paga realizada pela coorte em W / usuários ativados
  - custo das utilizações gratuitas da coorte em W
)
```

Essas fórmulas são operacionais, não copy pública. Até haver compra atribuída e
custo real, o CAC e o payback permanecem não observados.

#### Matriz de decisão

| Situação | Decisão |
| --- | --- |
| Vídeo retém, mas ninguém clica | ajustar promessa e CTA |
| Há clique, mas pouco cadastro | revisar continuidade anúncio → landing e fricção do login |
| Há cadastro, mas pouca criação | corrigir onboarding, confirmação de e-mail e primeiro uso |
| Há criação, mas nenhuma compra | revisar momento, oferta, preço, custo percebido e qualidade |
| Compra existe, mas margem é negativa | não escalar; corrigir economia |
| Um ângulo gera ativação e margem | criar variações do mesmo território antes de abrir novos públicos |

### A — Aprendizado

#### Hipóteses a testar, em ordem

1. Homenagem gera maior ativação que “gerador de música”.
2. Demonstração real da interface supera anúncio puramente visual.
3. “100% brasileirada” melhora identificação, mas “sua história vira música”
   explica melhor o valor.
4. Negócios geram menos cadastros, porém maior taxa de compra.
5. A primeira música concluída prediz compra melhor que cadastro confirmado.
6. Clube converte melhor depois da segunda sessão de criação do que na primeira.

#### O que ainda é desconhecido

- custo variável real por música entregue;
- margem de contribuição por pacote;
- taxa de e-mail confirmado;
- taxa de cadastro confirmado para primeira música;
- qualidade e prazo médio da geração em produção;
- taxa de retorno em 7 dias;
- primeira compra e recompra por coorte;
- licença comercial que pode ser prometida publicamente;
- conta de anúncios, página, Instagram, dataset e domínio verificado no Business
  Manager;
- verba máxima de teste.
- mediana, p95 e taxa de sucesso de geração;
- custo das músicas gratuitas, falhas e retries;

Não preencher essas lacunas com benchmark genérico. O primeiro ciclo existe
para criar o baseline da Academia.

## Backlog antes de publicar

### P0 — obrigatório

- [ ] Criar eventos próprios `registration_started` e
  `registration_confirmed`.
- [ ] Capturar `utm_content`, `utm_term`, `fbclid`, `_fbp` e `_fbc`.
- [ ] Preservar first-touch e last-non-direct na conta confirmada, junto da
  versão/data do consentimento.
- [ ] Renomear o CTA gratuito de `checkout_cta` para `free_signup_cta`.
- [ ] Enviar `CompleteRegistration` pelo caminho consentido e validar no Events
  Manager.
- [ ] Criar marcador idempotente `first_music_<accountId>`.
- [ ] Enviar `Purchase` de recarga e assinatura somente após confirmação do
  provedor.
- [ ] Implementar Conversions API com deduplicação entre navegador e servidor.
- [ ] Atualizar o relatório do funil para o fluxo gratuito:
  landing → cadastro → primeira música → Pix → compra.
- [ ] Validar domínio, dataset, página, Instagram e permissões no Business
  Manager.
- [ ] Confirmar os direitos de uso que podem aparecer no anúncio e na landing.
- [ ] Medir custo variável e margem de cada pacote.
- [ ] Corrigir no celular a colisão entre consentimento, CTA fixo e botão de
  cadastro.
- [ ] Criar landing de Homenagem que repita a promessa do anúncio.
- [ ] Publicar uma prova musical autorizada para Homenagem, Jingle e Compositor.
- [ ] Remover ou comprovar o selo “MAIS ESCOLHIDO”; zero compras não sustentam
  essa alegação.
- [ ] Tornar visível, sem pressão, que criar mais custa a partir de R$ 49,97 e
  que a recarga é opcional.
- [ ] Disponibilizar controle persistente para alterar ou revogar consentimento.

### P1 — aumenta qualidade

- [ ] Registrar o motivo de criação escolhido pelo usuário.
- [ ] Criar uma página/variação de entrada para Homenagem e outra para Negócios,
  mantendo uma única promessa em cada.
- [ ] Montar biblioteca de trechos autorizados por ritmo e intenção.
- [ ] Criar painel de coorte por origem, campanha e conteúdo.
- [ ] Criar audiência de usuário ativado, comprador e assinante com
  consentimento e retenção definidos.

## Checklist de liberação

- [ ] Nenhum anúncio está publicado antes da aprovação explícita de orçamento.
- [ ] Destino abre rápido no celular e mantém as UTMs.
- [ ] Cadastro, confirmação de e-mail e primeira música foram testados do
  anúncio simulado ao resultado.
- [ ] Consentimento não cobre CTA nem botão de cadastro em 390×844.
- [ ] Pixel Helper e Test Events mostram os eventos esperados.
- [ ] Compra de teste é deduplicada e o valor chega em reais.
- [ ] Política de privacidade descreve a mensuração usada.
- [ ] Textos não fazem afirmações sem prova.
- [ ] Áudio, foto e depoimento têm autorização.
- [ ] Cada criativo possui 9:16 e adaptação 4:5.
- [ ] Limite total, limite diário e regra de parada foram aprovados.
- [ ] Relatório usa dado próprio para receita confirmada.

## Fontes consultadas

- Meta, [Sales ads](https://www.facebook.com/business/ads/ad-objectives/sales)
- Meta, [About Conversions API](https://www.facebook.com/business/help/AboutConversionsAPI)
- Meta, [Advantage+ Audience](https://www.facebook.com/business/ads/meta-advantage-plus/audience)
- Meta, [Advantage+ Placements](https://www.facebook.com/business/ads/meta-advantage-plus/placements)
- Meta, [Facebook and Instagram Reels ads](https://www.facebook.com/business/ads/facebook-instagram-reels-ads)
- Meta, [Ad review, policy and support](https://www.facebook.com/business/ads/review-policy-guidelines)
- [Cantivy](https://cantivy.com/baixar/), oferta pública observada em 27/07/2026
- [Criar Música IA](https://criarmusicaia.com/), oferta pública observada em 27/07/2026
- [JingleLab](https://jinglelab.com.br/), oferta pública observada em 27/07/2026

As páginas concorrentes são usadas como evidência de posicionamento declarado,
não como prova independente de entrega, volume, clientes ou resultado.

## Próximo movimento

Instrumentar e validar em produção
`cadastro confirmado → primeira música → compra Pix` antes de ativar mídia.
Em paralelo, publicar três criativos orgânicos por sete dias e escolher a
mensagem que gera mais primeiras músicas concluídas — não apenas mais views —
para decidir qual anúncio merece orçamento.
