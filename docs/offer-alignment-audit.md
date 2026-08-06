# Auditoria de alinhamento da oferta

Data: 29 de julho de 2026  
Escopo: jornada pública mobile, cadastro, checkout, créditos, termos e contrato técnico do produto.

## Diagnóstico executivo

**Saúde geral: crítica antes de anunciar.**

O visual é forte e tem identidade, mas hoje existem duas ofertas diferentes
convivendo no mesmo produto:

1. a oferta pública ativa promete uma música grátis por dia e vende recargas
   somente depois;
2. a estratégia de campanha proposta retira a música completa grátis, mantém
   apenas uma prévia criativa e cobra R$ 49,97 pelo primeiro projeto.

Além disso, “20 músicas” não descreve corretamente a mecânica. O contrato
técnico é:

- 20 créditos musicais;
- consumo de 2 créditos por rodada paga;
- 10 rodadas pagas;
- até 2 versões por rodada;
- potencial de até 20 músicas.

**Recomendação:** não colocar os R$ 500 em mídia enquanto anúncio, página,
checkout, créditos, termos e eventos não contarem a mesma história.

## Jornada auditada

### 1. Página inicial — precisa de correção

![Página inicial mobile](../output/product-design-audit/01-home-hero.png)

Pontos fortes:

- identidade visual memorável e brasileira;
- campo de história aparece cedo;
- proposta emocional é mais atraente que “gerador de música com IA”;
- CTA principal é fácil de localizar.

Problemas:

- a manchete promete “duas músicas”, mas o benefício grátis entrega uma;
- “Criar grátis”, “1 música grátis por dia” e “R$ 0” conflitam com a nova
  proposta paga;
- os três argumentos abaixo do CTA estão pequenos e com baixo contraste no
  mobile;
- a prova principal é um jingle em Trap BR, enquanto a campanha deve vender
  presente/homenagem emocional;
- “duas versões por rodada” não explica que a rodada paga consome 2 créditos.

### 2. Cadastro — visualmente saudável, comercialmente desalinhado

![Cadastro mobile](../output/product-design-audit/02-cadastro.png)

Pontos fortes:

- formulário limpo, legível e com boa hierarquia;
- Google e e-mail oferecem caminhos claros;
- requisitos da senha ficam visíveis;
- o consentimento de medição da Meta existe.

Problemas:

- “Comece sem pagar”, “1 grátis todo dia” e “criar minha conta grátis”
  continuam vendendo o modelo gratuito;
- a história digitada na home não aparece no cadastro, criando risco de o
  usuário sentir que perdeu o contexto;
- o próximo passo e o que será recebido antes do pagamento não estão
  explicitados.

### 3. Checkout público — crítico

![Checkout público mobile](../output/product-design-audit/03-checkout-publico.png)

Problemas:

- `/checkout/` é uma página de R$ 0, não o checkout de R$ 49,97;
- existe um componente antigo de checkout pago com R$ 49,97 no repositório,
  mas ele não está conectado à rota pública atual;
- no mobile, o cartão de preço aparece antes da manchete, enfraquecendo a
  narrativa;
- a página reforça “uma música grátis todos os dias”;
- o WhatsApp ainda usa “Academia Música IA”, enquanto a marca visível é
  `musicacom.ia`;
- uma campanha paga que prometa o Projeto Música Presente desembocaria em uma
  oferta diferente.

### 4. Créditos — produto real, nomenclatura errada

![Tela de créditos](../output/product-design-audit/04-creditos.png)

![Plano de 20 músicas](../output/product-design-audit/05-planos-completos.png)

Problemas:

- “20 músicas” parece significar 20 rodadas, mas representa 20 créditos;
- “R$ 2,50 por música” só é verdadeiro se cada crédito equivaler de forma
  garantida a uma música entregue;
- o botão “Adicionar 20 músicas” repete a ambiguidade;
- “Sua música grátis volta amanhã” mantém o modelo que se pretende remover;
- “Mais escolhido” não deve ser usado sem evidência real de preferência;
- um visitante sem contexto pode ver saldo zero e mensagem de renovação diária
  antes mesmo de entender a oferta.

### 5. Termos — claros para o modelo atual, incompatíveis com o novo

![Termos atuais](../output/product-design-audit/06-termos.png)

Os termos atuais dizem expressamente:

- conta gratuita;
- uma música gratuita por dia;
- primeira criação gratuita;
- música diária gratuita;
- recargas opcionais.

Se a música completa grátis for retirada, as seções 2, 4, 5 e 10 precisam ser
atualizadas antes da campanha.

## Oferta única recomendada

### Nome

**Projeto Música Presente**

### Promessa

> Transforme uma história verdadeira em música.  
> Monte gratuitamente a letra, o clima e o estilo. Pague somente para gerar as
> versões completas.

### Produto inicial

**R$ 49,97, pagamento único via Pix**

- 20 créditos musicais;
- 10 rodadas pagas de criação;
- até 2 versões por rodada;
- potencial de até 20 músicas;
- biblioteca, player e download;
- criação de capa;
- tutorial de lançamento.

### Linguagem obrigatória

Usar sempre:

> 20 créditos musicais = 10 rodadas pagas, com até 2 versões por rodada.

Não usar isoladamente:

- “20 músicas”;
- “20 criações”;
- “10 músicas”;
- “duas músicas” sem explicar rodada e crédito;
- “R$ 2,50 por música” como equivalência garantida.

## Correções por prioridade

### P0 — antes de investir

1. Escolher oficialmente o modelo pago com prévia criativa grátis.
2. Criar uma landing page específica do Projeto Música Presente.
3. Fazer o checkout público cobrar R$ 49,97 e mostrar exatamente o que está
   incluído.
4. Trocar “20 músicas” por “20 créditos / 10 rodadas / até 20 músicas” no
   catálogo, nos botões, no Pix, nos e-mails e no pós-compra.
5. Remover “uma música grátis por dia” da home, cadastro, checkout, gerador,
   créditos, academia, FAQ e termos.
6. Atualizar os termos e a política de reembolso para o fluxo pago.
7. Remover o selo “Mais escolhido” até existir prova.
8. Substituir a prova em Trap/Jingle por uma homenagem emocional com
   antes/depois: história, letra e trecho da música.
9. Padronizar o nome da marca no WhatsApp e nas mensagens automáticas.
10. Validar Pixel + CAPI nos eventos: visualização, início da prévia, prévia
    concluída, checkout, Pix gerado e compra confirmada.

### P1 — melhora forte de conversão

1. Preservar a história informada na home durante cadastro e checkout.
2. Mostrar um resumo da história, emoção e estilo antes do Pix.
3. Explicar em uma linha o que é gratuito e o que é pago.
4. Exibir prazo estimado de geração, suporte e regra de tentativa com falha.
5. Melhorar tamanho e contraste dos microbenefícios no hero mobile.
6. Colocar headline, demonstração e oferta antes do cartão de pagamento no
   checkout mobile.
7. Criar três provas coerentes com a campanha: mãe, casal e aniversário.

## Copy alinhada para a nova página

### Hero

> **A história de alguém especial, transformada em música.**
>
> Monte gratuitamente a letra, o clima e o estilo. Quando estiver do seu jeito,
> libere as versões completas por R$ 49,97.

CTA:

> **Começar minha prévia grátis**

### Bloco de preço

> **Projeto Música Presente — R$ 49,97**
>
> Pagamento único via Pix. Inclui 20 créditos musicais: 10 rodadas pagas, com
> até 2 versões em cada rodada. Potencial de até 20 músicas.

CTA:

> **Gerar minhas versões completas**

## Limites desta auditoria

- auditoria feita em viewport mobile de 390 × 844;
- não foi concluída uma compra Pix real;
- não foi auditado o fluxo autenticado após pagamento;
- riscos de acessibilidade foram avaliados visualmente, sem teste completo com
  leitor de tela ou navegação exclusivamente por teclado;
- a mecânica de créditos foi conferida no contrato técnico atual do repositório.
