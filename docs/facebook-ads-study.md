# Estudo SaraivaOS — Facebook e Instagram Ads

**Produto:** musicacom.ia

**Domínio:** https://musicacom.ia.br

**Data do estudo:** 27 de julho de 2026

**Atualização do plano de mídia:** 29 de julho de 2026

**Status:** estratégia e preparação; nenhuma campanha publicada e nenhum orçamento ativado.

## Plano executivo para os R$ 500

Os R$ 500 devem ser tratados como **verba de validação**, não como verba de
escala. O teste precisa responder três perguntas:

1. qual promessa traz uma conta realmente confirmada;
2. qual promessa leva a pessoa a concluir a primeira música;
3. quantos desses usuários iniciam ou confirmam uma compra.

### Verdade atual do funil

Leitura de produção dos últimos 30 dias em 29/07/2026:

| Sinal | Sessões únicas |
| --- | ---: |
| Visitas à landing | 38 |
| Cliques em “começar” | 2 |
| Aberturas do login | 19 |
| Aberturas do criador | 7 |
| Confirmações vinculadas da rota de criação | 3 |
| Checkouts abertos | 4 |
| Pix gerados | 1 |
| Compras confirmadas | 0 |
| Receita confirmada | R$ 0 |

Há 10 visitas com referência de Facebook, mas nenhuma venda atribuída. A
amostra ainda não permite calcular CAC, ROAS ou taxa de compra confiáveis.

### Estrutura recomendada

```text
Campanha: META_SALES_BR_FREE_DAILY_TESTE_R500_2026Q3
Objetivo: Vendas
Conversão: site
Orçamento vitalício: R$ 500
Duração: 7 dias
Conjunto: Brasil | 18+ | Advantage+ Audience | Advantage+ Placements
Anúncio 1: Homenagem — “Uma história de vocês pode virar música”
Anúncio 2: Demonstração — “De uma frase ao play”
Anúncio 3: Composição — “Sua música não precisa ficar só na ideia”
```

O orçamento vitalício protege o teto de R$ 500. A média equivalente é de
R$ 71,43 por dia, mas a Meta poderá distribuir valores diferentes entre os dias
conforme as oportunidades de entrega. Não dividir em três conjuntos nem
reservar verba para retargeting neste primeiro ciclo: o volume atual é pequeno
demais e a fragmentação reduziria a aprendizagem.

O evento inicial de otimização deve ser `CompleteRegistration`. Depois que
`first_music_created` acumular volume e estiver validado, ele passa a ser a
conversão principal. `Purchase` só deve assumir a otimização quando houver
compras confirmadas suficientes e consistentes.

### Distribuição lógica do teste

Não haverá divisão manual de dinheiro entre anúncios; os três criativos ficam
no mesmo conjunto para a Meta distribuir a entrega. O controle ocorre por
marcos cumulativos:

| Gasto acumulado | O que precisa ser verdade | Decisão |
| ---: | --- | --- |
| Antes de R$ 1 | Pixel, `CompleteRegistration`, UTMs e destino validados | não publicar se qualquer elo falhar |
| R$ 150 | existe ao menos um cadastro confirmado atribuído | se for zero, pausar e corrigir anúncio/landing |
| R$ 250 | existe ao menos uma primeira música atribuída | se for zero, pausar e corrigir ativação |
| R$ 350 | existem sinais posteriores: retorno, checkout ou Pix | se forem zero, não tratar o teste como candidato a escala |
| R$ 500 | calcular custo por cadastro, ativado e compra | decidir novo ciclo; não renovar automaticamente |

Esses marcos são **travas de desperdício**, não benchmarks de mercado. Um único
cadastro ou uma única música não prova sucesso; apenas evita continuar gastando
quando o caminho está completamente quebrado.

### Matemática do retorno

A entrada custa R$ 49,97. Para recuperar R$ 500 apenas em faturamento bruto,
seriam necessárias 11 compras:

```text
11 × R$ 49,97 = R$ 549,67
```

Dez compras gerariam R$ 499,70 e ainda não cobririam a mídia. O ponto de
equilíbrio real é mais alto porque cada compra possui custo de geração, taxa do
Pix, impostos, reembolsos e suporte.

| Margem de contribuição hipotética | Contribuição por compra | Compras para cobrir R$ 500 |
| ---: | ---: | ---: |
| 70% | R$ 34,98 | 15 |
| 50% | R$ 24,99 | 21 |
| 30% | R$ 14,99 | 34 |

Os percentuais acima são cenários matemáticos, não a margem observada do
produto. A margem real precisa ser medida antes de qualquer escala.

### Placar que decide o próximo investimento

```text
Custo por cadastro confirmado =
gasto / cadastros confirmados atribuídos
```

```text
Custo por usuário ativado =
gasto / contas que concluíram a primeira música
```

```text
CAC de compra =
gasto / compras confirmadas atribuídas
```

```text
ROAS confirmado =
receita confirmada no backend / gasto
```

O criativo vencedor é o que produz mais **primeiras músicas e contribuição
confirmada**, não o que gera mais curtidas, visualizações ou CTR isoladamente.

### Condição para colocar no ar

O teste de R$ 500 fica liberado quando:

- `CompleteRegistration` aparece corretamente no Events Manager;
- origem, campanha e criativo acompanham a conta confirmada;
- a primeira música é identificável e atribuível;
- `Purchase` é enviado somente depois da confirmação do Pix;
- os três vídeos usam áudio real autorizado e possuem versões 9:16 e 4:5;
- a jornada completa funciona no celular;
- o limite vitalício de R$ 500 e a data final estão configurados.

Até essas condições serem provadas, o orçamento permanece intacto.

## Estudo de expectativa agressiva — R$ 500

### A expectativa que vamos perseguir

O alvo agressivo do primeiro ciclo é:

| Resultado | Meta em 7 dias |
| --- | ---: |
| Impressões | 30.000–45.000 |
| Cliques no site | 450–550 |
| Cadastros confirmados | 60–75 |
| Primeiras músicas concluídas | 35–45 |
| Compras confirmadas até o dia 14 | 5–7 |
| Compras acumuladas até o dia 30 | 9–12 |
| Receita bruta esperada em 30 dias | R$ 449,73–R$ 599,64 |

Esta é uma **meta de execução**, não uma promessa. Ela exige criativo forte,
landing coerente, cadastro funcionando, música entregue e recuperação ativa de
quem criou e ainda não comprou.

Como referência externa, um painel de benchmarks brasileiros de junho de 2026
apresenta mediana geral de CTR de 1,05%, CPC de R$ 1,50 e CPM de R$ 15,75. O
produto precisa superar a mediana em CTR e CPC porque oferece entrada gratuita
e possui uma demonstração visual/emocional forte. Benchmarks são direção, não
previsão do resultado da musicacom.ia.

### Quatro cenários

Os cenários abaixo partem de R$ 500 de mídia, preço inicial de R$ 49,97 e compra
medida até 14 dias após o clique.

| Cenário | CPC | Clique → cadastro | Cadastro → 1ª música | Ativado → compra | Cliques | Cadastros | Ativados | Compras | Receita | ROAS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Piso ruim | R$ 2,50 | 8% | 40% | 5% | 200 | 16 | 6 | 0–1 | R$ 0–49,97 | 0–0,10 |
| Expectativa provável | R$ 1,50 | 10% | 50% | 10% | 333 | 33 | 17 | 2 | R$ 99,94 | 0,20 |
| Meta agressiva | R$ 1,00 | 15% | 60% | 15% | 500 | 75 | 45 | 7 | R$ 349,79 | 0,70 |
| Ruptura | R$ 0,75 | 20% | 70% | 20% | 667 | 133 | 93 | 19 | R$ 949,43 | 1,90 |

O cenário provável representa o que pode acontecer se apenas colocarmos mídia
na proposta atual. A meta agressiva pressupõe as correções de promessa, prova,
mensuração e recuperação descritas neste estudo. Ruptura significa que o
criativo virou um vencedor fora da curva e o funil manteve essa qualidade até a
compra.

### Expectativa por tempo

#### Durante os 7 dias de mídia

Meta agressiva:

- CTR de saída igual ou superior a 1,5%;
- CPC igual ou inferior a R$ 1,00;
- 75 cadastros confirmados;
- 45 primeiras músicas;
- 3–5 compras já confirmadas.

#### Até 14 dias após o início

- 5–7 compras acumuladas;
- faturamento entre R$ 249,85 e R$ 349,79;
- CAC entre R$ 71,43 e R$ 100;
- ROAS bruto entre 0,50 e 0,70.

Esse resultado ainda não paga a mídia, mas prova que existe uma cadeia
`anúncio → experiência → compra` e cria uma coorte que pode retornar.

#### Até 30 dias

Com e-mail, retorno ao repertório e oferta apresentada no momento certo:

- alvo: 9–12 compras acumuladas;
- faturamento: R$ 449,73–R$ 599,64;
- ROAS bruto: 0,90–1,20;
- CAC final: R$ 41,67–R$ 55,56.

Sem recuperação pós-criação, a expectativa permanece próxima do resultado de 14
dias. O dinheiro não está apenas no anúncio; está em trazer de volta quem já
ouviu a própria música.

### Meta econômica

| Marco | Compras | Receita bruta | CAC | Leitura |
| --- | ---: | ---: | ---: | --- |
| Tração | 5 | R$ 249,85 | R$ 100 | há compra, mas o funil ainda perde dinheiro |
| Meta agressiva D14 | 7 | R$ 349,79 | R$ 71,43 | sinal comercial; ainda não é escala |
| Equilíbrio bruto | 11 | R$ 549,67 | R$ 45,45 | recupera a mídia antes dos custos do produto |
| Sinal de escala | 15 | R$ 749,55 | R$ 33,33 | ROAS 1,50; validar margem antes de aumentar |
| Máquina forte | 21 | R$ 1.049,37 | R$ 23,81 | ROAS 2,10; pode pagar mídia com margem próxima de 50% |

O alvo de verdade não é sete vendas. Sete vendas validam desejo. **Quinze
vendas sinalizam escala. Vinte e uma vendas sinalizam uma possível máquina
economicamente saudável**, desde que custo de geração, Pix, impostos, suporte e
reembolso caibam nos R$ 26,16 restantes por pedido.

### Semáforo do primeiro R$ 500

| Resultado final | Diagnóstico | Próxima decisão |
| --- | --- | --- |
| 0–1 compra | proposta/funil não validado | não reinvestir; corrigir oferta e ativação |
| 2–4 compras | existe curiosidade, não economia | manter orgânico e refazer criativo/upsell |
| 5–7 compras | desejo comercial validado | rodar recuperação por 30 dias antes de escalar |
| 8–10 compras | forte sinal de mercado | preparar segundo ciclo controlado |
| 11–14 compras | equilíbrio bruto alcançado | reinvestir com margem e coorte acompanhadas |
| 15+ compras | anúncio e oferta vencedores | iniciar escala e produzir variações do vencedor |

### Operação agressiva necessária

Para buscar o cenário agressivo, a campanha não pode terminar no cadastro:

1. **Criativo abre com o resultado.** Nos primeiros dois segundos, ouvir o
   refrão e ver a reação antes de explicar a ferramenta.
2. **Landing repete a mesma história.** Anúncio de Homenagem abre uma experiência
   de Homenagem, com exemplo emocional e ideia pré-preenchida.
3. **Primeira música vira venda.** Após a entrega, apresentar:

   > Gostou da direção? Libere 20 créditos por R$ 49,97: são 10 rodadas pagas,
   > com até duas versões em cada.

4. **Recuperação em 24 e 72 horas.** Lembrar a pessoa da música, convidar para
   ouvi-la novamente e mostrar a continuidade, respeitando consentimento.
5. **Prova específica.** Uma Homenagem real, um resultado “frase ao play” e uma
   composição guardada no bloco de notas.
6. **Mensuração até o dinheiro.** Cadastro, primeira música, checkout, Pix e
   compra precisam carregar campanha e criativo.

### Métricas de ataque

| Métrica | Vermelho | Aceitável | Meta agressiva | Ruptura |
| --- | ---: | ---: | ---: | ---: |
| CTR de saída | < 1% | 1%–1,49% | 1,5%–2,49% | ≥ 2,5% |
| CPC | > R$ 2,50 | R$ 1,01–2,50 | ≤ R$ 1,00 | ≤ R$ 0,75 |
| Clique → cadastro | < 8% | 8%–14,9% | ≥ 15% | ≥ 20% |
| Cadastro → 1ª música | < 40% | 40%–59,9% | ≥ 60% | ≥ 70% |
| Ativado → compra D14 | < 5% | 5%–14,9% | ≥ 15% | ≥ 20% |

### Regras de corte

- Com R$ 100 gastos: se CTR estiver abaixo de 1% e CPC acima de R$ 2,50, o
  criativo não merece o restante do orçamento.
- Com R$ 200 gastos: se houver menos de 10 cadastros confirmados, pausar o
  conjunto e corrigir promessa/landing.
- Com R$ 300 gastos: se houver menos de 10 primeiras músicas, pausar e corrigir
  cadastro/onboarding/entrega.
- Com R$ 500 gastos: não renovar automaticamente. Esperar a janela de 14 dias e
  classificar pelo semáforo.

Não fazer pequenas edições diárias. As regras acima existem para interromper
falha clara, não para reagir a cada oscilação.

## Se retirarmos a primeira música grátis

### Decisão recomendada

Retirar o áudio gratuito pode melhorar a economia e filtrar curiosos, mas não
devemos retirar todo o valor antes do pagamento.

> **Retirar a música grátis. Manter uma prévia criativa grátis. Cobrar para
> ouvir, baixar e continuar o projeto.**

O visitante conta a história e recebe gratuitamente:

- sugestão de título;
- trecho de refrão;
- emoção principal;
- direção de ritmo e voz;
- resumo do que será criado.

Essa prévia utiliza texto e não precisa consumir uma geração musical completa.
Ela cria envolvimento e permite que a pessoa veja a própria história tomando
forma antes do checkout.

### Funil proposto

```text
Anúncio emocional
→ pessoa conta a história
→ prévia criativa gratuita
→ oferta do Projeto Música Presente
→ Pix
→ duas primeiras versões
→ capa e download
→ repertório e novas criações
```

O anúncio continua vendendo a transformação, não a tecnologia:

> **Conte uma história. Veja como ela pode virar música.**

Depois da prévia:

> **Sua música está pronta para ganhar voz.**
>
> Receba a primeira rodada com até duas versões completas, escolha a sua
> preferida, crie a capa e faça o download. O pacote inclui 20 créditos: 10
> rodadas pagas, com até duas versões em cada.
>
> **Pagamento único de R$ 49,97 via Pix.**

### Produto recomendado

**Nome:** Projeto Música Presente

**Preço inicial:** R$ 49,97, pagamento único.

**Entrega comunicada:**

- primeira rodada com até duas versões completas da história;
- 20 créditos musicais no total;
- 10 rodadas pagas, consumindo dois créditos por rodada;
- até duas versões por rodada, totalizando até 20 músicas;
- escolhas de emoção, ritmo e voz;
- repertório com player;
- criação de capa;
- download;
- acesso permanente à plataforma;
- novas tentativas quando uma geração falhar antes da entrega, conforme os
  termos.

O consumidor emocional compra a chance de chegar à música certa. A promessa
principal deve vender esse resultado, mas a mecânica precisa ficar explícita:
20 créditos, 10 rodadas pagas e até duas versões por rodada.

### Expectativa com R$ 500

#### Modelo com prévia gratuita e áudio pago

| Cenário | CPC | Visitas | Prévia concluída | Checkout iniciado | Compras | Receita | ROAS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Fraco | R$ 2,50 | 200 | 30 | 5 | 1 | R$ 49,97 | 0,10 |
| Provável | R$ 1,50 | 333 | 67 | 10 | 3 | R$ 149,91 | 0,30 |
| Meta agressiva | R$ 1,00 | 500 | 150 | 30 | 11 | R$ 549,67 | 1,10 |
| Ruptura | R$ 0,75 | 667 | 233 | 58 | 23 | R$ 1.149,31 | 2,30 |

Hipóteses do cenário agressivo:

- 30% das visitas concluem a prévia;
- 20% das prévias iniciam checkout;
- 35% dos checkouts confirmam o Pix.

Com esse desenho, **11 compras representam o primeiro equilíbrio bruto**. O
resultado líquido ainda depende do custo das músicas, Pix, impostos, suporte e
reembolso.

### Por que não vender a primeira música por R$ 9,90

Com R$ 500 de mídia seriam necessárias 51 vendas apenas para recuperar o
investimento bruto. Mesmo com 500 cliques, isso exige conversão superior a 10%.
A entrada barata aumenta compradores, mas não resolve o custo de aquisição.

| Preço | Compras para recuperar R$ 500 | Conversão necessária com 500 visitas |
| ---: | ---: | ---: |
| R$ 9,90 | 51 | 10,2% |
| R$ 19,90 | 26 | 5,2% |
| R$ 29,90 | 17 | 3,4% |
| R$ 39,90 | 13 | 2,6% |
| R$ 49,97 | 11 | 2,2% |

R$ 49,97 é o melhor ponto inicial para testar porque já corresponde ao produto
existente, mantém espaço econômico e continua abaixo de ofertas públicas que
vendem uma única música personalizada por valor maior. Isso não prova que o
preço converterá; apenas torna o teste economicamente possível.

### Alternativa mais simples: venda direta

Também é possível levar o anúncio diretamente ao checkout de R$ 49,97:

```text
Anúncio
→ landing com exemplo e oferta
→ Pix
→ cadastro
→ criação
```

Vantagem: menos etapas.

Desvantagem: exige prova emocional muito forte para convencer tráfego frio sem
qualquer personalização antes do pagamento.

Com CPC de R$ 1,00, os R$ 500 gerariam cerca de 500 visitas. Seriam necessárias
11 compras, ou conversão de 2,2%, apenas para o equilíbrio bruto. É possível,
mas mais arriscado que a prévia personalizada.

### Oferta e copy

**Anúncio:**

> Eu contei uma história sobre alguém que mudou a minha vida. Foi isso que
> voltou em forma de música.
>
> Conte a sua história e veja gratuitamente o refrão e a direção que ela pode
> ganhar.

**CTA:** Criar minha prévia

**Depois da prévia:**

> Você já tem a história, o refrão e a direção.
>
> Agora transforme tudo em duas músicas completas.

**Botão:** Ouvir minha história por R$ 49,97

### Garantia recomendada

Não prometer que toda pessoa amará o resultado artístico. Prometer o que a
operação consegue controlar:

- pagamento confirmado libera o saldo;
- tentativa que falha antes da entrega devolve o saldo reservado;
- suporte acompanha falhas técnicas;
- condições de reembolso ficam visíveis antes do pagamento;
- nenhuma cobrança recorrente no Projeto Música Presente.

### Campanha sem gratuidade musical

```text
Campanha: META_SALES_BR_MUSICA_PRESENTE_R500_2026Q3
Objetivo: Vendas
Conversão: site
Evento: Purchase
Orçamento vitalício: R$ 500
Duração: 7 dias
Conjunto: Brasil | 18+ | Advantage+ | placements automáticos
Anúncios: Homenagem | Frase ao refrão | História no bloco de notas
```

Mesmo sem volume para sair da aprendizagem, a campanha deve otimizar para
`Purchase`, porque cadastro ou prévia deixou de ser o resultado econômico
principal. `PreviewCreated` e `InitiateCheckout` permanecem como eventos de
diagnóstico.

### Veredito

> **Se removermos a primeira música grátis, eu escolheria prévia criativa grátis
> + Projeto Música Presente por R$ 49,97.**

Esse modelo:

- reduz o custo de servir curiosos;
- mantém reciprocidade antes do pagamento;
- personaliza a venda;
- transforma o checkout em continuação natural da história;
- permite buscar equilíbrio bruto com 11 vendas em vez de depender de uma
  monetização tardia da conta gratuita.

## Validação da proposta comercial

### Veredito

> **A proposta é boa e tem apelo real, mas ainda não está pronta para receber
> tráfego pago sem ajustes. Nota atual: 6,5/10.**

A força está na transformação emocional e fácil de experimentar:

> **Conte uma história. Escute essa história virar música. Comece grátis.**

O problema não é falta de produto. É que a página mistura promessas,
quantidades e públicos diferentes, reduzindo a confiança justamente antes do
cadastro.

### Placar da proposta

| Critério | Nota | Leitura |
| --- | ---: | --- |
| Desejo | 8/10 | transformar uma história em música é emocional, demonstrável e compartilhável |
| Clareza | 6/10 | a ideia central é entendida, mas “uma” e “duas músicas” aparecem como se fossem o mesmo benefício |
| Diferenciação | 6/10 | português e ritmos brasileiros ajudam, porém já aparecem em concorrentes |
| Prova | 5/10 | existe um áudio real, mas o exemplo de Trap/Jingle não prova a principal promessa de Homenagem |
| Redução de risco | 9/10 | grátis, sem cartão e sem prazo de teste removem a objeção inicial |
| Confiança comercial | 5/10 | faltam exemplos por intenção, usuários reais e regras claras de direitos de uso |
| Monetização | 4/10 | o visitante entende que existem recargas, mas não vê preço nem o que poderá comprar depois |
| Prontidão para anúncio | 5/10 | visual forte e cadastro limpo; mensagem e mensuração ainda precisam de correção |

### O que está forte

1. **A transformação é melhor que a categoria.** “Sua história vira música” é
   mais desejável do que “gerador de música com IA”.
2. **O primeiro passo é concreto.** O campo de história no hero faz a pessoa
   começar antes do cadastro e preserva a ideia na próxima página.
3. **O risco é baixo.** A conta grátis e a ausência de cartão tornam a
   experimentação natural.
4. **A jornada visual está boa no celular.** Hierarquia, contraste, CTA e
   cadastro com Google estão claros.
5. **O produto continua depois do arquivo.** Repertório, player, capa e tutorial
   sustentam uma proposta de estúdio, não apenas de geração isolada.

### O que enfraquece a oferta

#### 1. A quantidade prometida é contraditória

O hero diz:

> “Duas músicas para sentir.”

Na mesma dobra aparece:

> “1 música grátis por dia.”

Os termos esclarecem que a criação gratuita entrega **uma música** e apenas as
criações extras normalmente entregam duas versões. Portanto, a manchete e
“duas versões por rodada” criam uma expectativa superior ao benefício gratuito.

**Correção recomendada:**

> **Uma história sua. Uma música para sentir.**

ou:

> **Uma história sua. Transformada em música.**

Na oferta paga:

> **Nas criações extras, você recebe duas versões para comparar.**

#### 2. A prova não corresponde à promessa principal

A página abre com história e homenagem, mas a única prova destacada é um
`Trap Jingle`. Quem chegou por um anúncio sobre mãe, pai, casal ou memória não
ouve a transformação que foi prometida.

**Correção recomendada:** colocar uma música de Homenagem autorizada como prova
principal e manter Jingle como prova específica para uma futura página de
Negócios.

#### 3. “Brasileirada” é personalidade, não vantagem exclusiva

Plataformas concorrentes também comunicam português, ritmos brasileiros,
criação gratuita, homenagens e jingles. O território brasileiro continua
valioso para identidade de marca, mas não deve carregar sozinho a
diferenciação.

A combinação mais defensável é:

> **Uma jornada guiada, sem prompt, que transforma sua história em música e
> organiza tudo em repertório, capa e próximos passos.**

#### 4. O público está amplo demais para uma única promessa

Homenagem, história pessoal, composição, Jingle e lançamento possuem desejos,
provas e objeções diferentes. A home pode apresentar todas as possibilidades,
mas cada anúncio precisa manter uma linha única até a prova:

```text
Anúncio de Homenagem
→ história já preenchida
→ exemplo emocional
→ cadastro
→ primeira música
```

```text
Anúncio de Composição
→ ideia do bloco de notas
→ exemplo de criação
→ cadastro
→ primeira música
```

#### 5. Jingle ainda não está pronto para mídia

Os termos atuais transferem ao usuário a responsabilidade por direitos autorais
e pelas regras das plataformas, mas não declaram uma licença comercial clara
para a música criada. Concorrentes de Jingle apresentam uso comercial como
parte central do produto.

**Decisão:** retirar Jingle do primeiro teste de R$ 500. Ele volta quando a
licença aplicável, limites de uso, preço e texto da oferta estiverem explícitos.

#### 6. A continuidade paga aparece tarde e sem preço

“Recargas opcionais” reduz pressão, mas esconde completamente a economia futura.
O usuário pode sentir surpresa quando descobrir R$ 49,97 somente depois da
primeira criação.

**Correção recomendada, sem transformar a home em checkout:**

> **Comece grátis. Quando quiser criar mais no mesmo dia, há recargas opcionais
> a partir de R$ 49,97.**

### Proposta recomendada

**Promessa principal:**

> **Transforme uma história sua em música. Grátis hoje.**

**Explicação:**

> Conte uma lembrança, homenagem ou ideia. Escolha emoção, ritmo e voz. A
> musicacom.ia entrega uma música completa para você ouvir e baixar — sem
> precisar cantar, tocar ou escrever prompt.

**Oferta de entrada:**

> 1 música grátis por dia, sem cartão.

**Continuidade:**

> Quer criar mais no mesmo dia? Escolha uma recarga. Nas criações extras, você
> recebe duas versões para comparar.

**Diferencial:**

> Criação guiada em português, repertório, capa e orientação no mesmo lugar.

### Decisão para a campanha

O primeiro R$ 500 deve testar:

1. **Homenagem:** maior força emocional e compartilhamento;
2. **Da frase ao play:** melhor demonstração do produto;
3. **Música que não saiu do papel:** intenção criativa sem depender de licença
   comercial.

Jingle fica como segunda frente, depois de resolver direitos de uso e construir
uma página/prova específica para negócios.

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
| Experiência comercial | Qual intenção possui desejo, prova e continuidade suficientes? | Homenagem deve abrir o funil; Compositor entra no primeiro teste e Jingle volta após a licença comercial ser definida. |
| Oferta e economia | Quanto podemos pagar para adquirir um usuário? | Ainda não existe CAC ou payback observável; os R$ 500 são um teto de validação condicionado à mensuração, não verba de escala. |
| Mensuração e segurança | Conseguimos ligar anúncio, conta, música e Pix confirmado? | Ainda não. A atribuição não chega à conta gratuita, faltam eventos de cadastro e primeira música, e não existe CAPI server-side. |

### Consenso operacional

1. **Não publicar mídia ainda.**
2. Corrigir a ligação
   `criativo → cadastro confirmado → primeira música → compra`.
3. Produzir prova real para Homenagem e Compositor; preparar Jingle após
   esclarecer a licença comercial.
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
    ├── COMPOSICAO_BLOCO_NOTAS_20S_V1
    ├── RESERVA: BRASIL_EM_RITMOS_MONTAGEM_15S_V1
    └── SEGUNDA FASE: JINGLE_NEGOCIO_DEMO_20S_V1
```

- Um conjunto de anúncios no início.
- Advantage+ Audience.
- Advantage+ Placements.
- Três anúncios ativos no teste de R$ 500; dois territórios ficam como reserva
  para o ciclo seguinte.
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

#### Território 3 — O som do seu negócio — segunda fase

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
   - demonstração da frase ao play;
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
- teto vitalício do primeiro teste fixado em R$ 500.

Estrutura:

- uma campanha;
- um conjunto amplo;
- três anúncios no primeiro ciclo;
- sete dias sem mudanças diárias, salvo erro, rejeição ou gasto de segurança;
- sem público semelhante e sem retargeting separado no primeiro ciclo.

Usar orçamento vitalício de R$ 500 por sete dias. A média de R$ 71,43 por dia
serve para acompanhamento; o teto financeiro é o orçamento vitalício.

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
- [ ] Publicar uma prova musical autorizada para Homenagem e Compositor.
- [ ] Definir a licença comercial antes de publicar a frente de Jingle.
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
- [Bossa](https://bossa.ia.br/), teste grátis e comunicação de uso comercial
  observados em 29/07/2026
- [IA Música](https://www.iamusica.com.br/gerador-de-musica-com-ia-brasil),
  português, ritmos brasileiros e criação grátis observados em 29/07/2026
- [mellodIA](https://www.mellodia.com.br/), oferta de música personalizada por
  R$ 67 observada em 29/07/2026
- [XYZ Lab, Meta Ads Benchmarks Brazil](https://xyzlab.com/meta-ads/benchmarks/brazil/),
  medianas brasileiras de CTR, CPC, CPM, conversão, CPA e ROAS de junho de 2026
- [WordStream, Facebook Ads Benchmarks 2025](https://www.wordstream.com/blog/facebook-ads-benchmarks-2025),
  referência complementar baseada em mais de mil campanhas dos Estados Unidos

As páginas concorrentes são usadas como evidência de posicionamento declarado,
não como prova independente de entrega, volume, clientes ou resultado.

## Próximo movimento

Instrumentar e validar em produção
`cadastro confirmado → primeira música → compra Pix` antes de ativar mídia.
Em paralelo, publicar três criativos orgânicos por sete dias e escolher a
mensagem que gera mais primeiras músicas concluídas — não apenas mais views —
para decidir qual anúncio merece orçamento.
