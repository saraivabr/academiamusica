# Campanha Meta Ads — Oferta V2 + Higgsfield

Data: 30 de julho de 2026  
Produto: Projeto Música Presente  
Destino: https://musicacom.ia.br  
Verba de validação: R$ 500  
Preço: R$ 49,97 via Pix

## Tese da campanha

A campanha não vende “música feita por IA”. Ela vende a emoção de transformar
uma história verdadeira em um presente que pode ser ouvido.

Promessa aprovada:

> Transforme uma história verdadeira em música. Monte gratuitamente a prévia
> de título, letra, clima e estilo. Se gostar da direção, libere as versões
> completas por R$ 49,97.

Contrato comercial:

- 20 créditos musicais;
- 10 rodadas pagas;
- até 2 versões por rodada;
- pagamento único via Pix;
- nenhuma música completa grátis.

## Estrutura de mídia

- Campanha: `META_SALES_BR_OFFER-V2_R500_202607`
- Objetivo: Vendas
- Local de conversão: site
- Orçamento: vitalício de R$ 500
- Duração: 7 dias
- Conjuntos: 1
- Público: Brasil, 25–54 anos, ambos os gêneros, Advantage+ Audience
- Posicionamentos: Advantage+ Placements
- Otimização inicial: `InitiateCheckout`
- Eventos de decisão: `pix_created` e `Purchase`
- Exclusões: compradores e clientes já ativos

Não dividir a verba em vários conjuntos. Os três anúncios competem dentro do
mesmo conjunto e a Meta distribui a entrega.

## Criativos Higgsfield

### Anúncio A — Oferta direta

Função: converter quem já entende o valor de um presente personalizado.

Imagem:

https://d8j0ntlcm91z4.cloudfront.net/user_3HCc1S8ikFZEiCysMcZTr30ZCAF/hf_20260730_013921_c2c3f59b-736c-48ce-b73f-037cd4f88013.png

Arquivos:

- `public/ads/offer-v2-higgsfield/03-oferta-direta-4x5.png`
- `public/ads/offer-v2-imagegen/03-oferta-direta-9x16.png`

Texto principal:

> Tem presente que a pessoa usa. E tem presente que ela guarda para sempre.
> Conte uma história verdadeira, monte gratuitamente a prévia e, se gostar da
> direção, libere as versões completas. Projeto Música Presente: R$ 49,97 via
> Pix.

Título:

> Uma história que vira música

Descrição:

> Prévia criativa grátis. Versões completas após o pagamento.

UTM:

`?utm_source=meta&utm_medium=paid_social&utm_campaign=offer_v2_r500&utm_content=oferta_direta`

### Anúncio B — Reação emocional

Função: interromper o scroll e despertar o desejo de homenagear alguém.

Imagem:

https://d8j0ntlcm91z4.cloudfront.net/user_3HCc1S8ikFZEiCysMcZTr30ZCAF/hf_20260730_013920_c526cb2c-94df-4b1a-8547-926b84b265e9.png

Arquivos:

- `public/ads/offer-v2-higgsfield/01-reacao-4x5.png`
- `public/ads/offer-v2-imagegen/01-reacao-9x16.png`

Texto principal:

> E se a história dela pudesse ser ouvida? Escreva os momentos, escolha o clima
> e veja gratuitamente a direção criativa da música. Você só paga quando quiser
> gerar as versões completas.

Título:

> A história dela virou música

Descrição:

> Comece pela prévia gratuita

UTM:

`?utm_source=meta&utm_medium=paid_social&utm_campaign=offer_v2_r500&utm_content=reacao_emocional`

### Anúncio C — Da frase ao play

Função: explicar o mecanismo sem linguagem técnica.

Imagem:

https://d8j0ntlcm91z4.cloudfront.net/user_3HCc1S8ikFZEiCysMcZTr30ZCAF/hf_20260730_014309_a4c28a4c-5208-41b8-9d47-75f7e27f5f99.png

Arquivos:

- `public/ads/offer-v2-higgsfield/02-frase-ao-play-4x5.png`
- `public/ads/offer-v2-imagegen/02-frase-ao-play-9x16.png`

Texto principal:

> Você não precisa saber cantar, compor ou produzir. Comece com uma frase sobre
> alguém importante. A musicacom.ia ajuda a transformar essa história em título,
> letra, clima e estilo — antes de você decidir gerar as versões completas.

Título:

> De uma frase ao play

Descrição:

> Faça sua prévia criativa

UTM:

`?utm_source=meta&utm_medium=paid_social&utm_campaign=offer_v2_r500&utm_content=frase_ao_play`

## Roteiro do vídeo principal

Formato: 9:16, 15 segundos.

1. 0–3s: filha entrega o fone à mãe.
2. 3–7s: três linhas de uma história sendo digitadas.
3. 7–11s: prévia criativa com título, trecho e estilo.
4. 11–15s: reação sutil e CTA.

Narração:

> A história da sua mãe pode caber em três linhas... e virar uma música que ela
> vai guardar para sempre. Na musicacom.ia você monta a prévia grátis. Gostou da
> direção? Libera 20 créditos por R$ 49,97. Toca em começar.

O modo de vídeo do Higgsfield exige plano pago nesta conta. O roteiro fica
aprovado, mas o vídeo não deve ser declarado como produzido até a geração
concluir em uma conta habilitada ou ser filmado/editado externamente.

As três imagens 4:5 foram geradas no Higgsfield e aprovadas visualmente. Depois
que o plano gratuito bloqueou novas gerações, as versões 9:16 finais foram
recompostas nativamente com o ImageGen, sem moldura, recorte automático ou
fundo desfocado.

## Regras agressivas de corte

| Gasto acumulado | Sinal mínimo | Decisão |
| ---: | --- | --- |
| R$ 100 | CTR de saída >= 1,5% e CPC <= R$ 2,00 | pausar apenas o criativo que falhar |
| R$ 200 | 8 prévias concluídas e 2 Pix gerados | se o conjunto falhar, corrigir anúncio ou página |
| R$ 350 | 1 compra confirmada | se houver zero compras, interromper o restante |
| R$ 500 | 5+ compras confirmadas | desejo validado; acompanhar coorte por 30 dias |

## Placar econômico

- 0–1 compra: proposta/funil não validado;
- 2–4 compras: curiosidade sem economia;
- 5–7 compras: desejo comercial validado;
- 8–10 compras: forte sinal de mercado;
- 11 compras: R$ 549,67 de receita e equilíbrio bruto da mídia;
- 15+ compras: candidato a escala, sujeito à margem real.

## Escolha inicial

Anúncio principal: **Oferta direta**.  
Challenger emocional: **Reação emocional**.  
Challenger explicativo: **Da frase ao play**.

O vencedor é o anúncio com menor custo por `Purchase` confirmado. CTR e
curtidas servem apenas para diagnóstico; não decidem a escala.
