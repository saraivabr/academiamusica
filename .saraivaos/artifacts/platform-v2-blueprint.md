# musicacom.ia — Blueprint da Plataforma V2

Data: 2026-07-26

## Sinais

- `provided`: a lateral atual não está prática.
- `provided`: o criador conversacional deve dar lugar a uma experiência direta e dinâmica.
- `provided`: R$197 não representa mais a estratégia comercial pretendida.
- `provided`: o curso deve ser incluído e a continuidade deve vir da recompra de créditos via Pix.
- `observed`: landing, checkout, termos, telemetria e Lambda ainda usam o preço e o pacote antigo.
- `observed`: o backend de geração já aceita uma direção estruturada sem depender da conversa.
- `observed`: o saldo atual é derivado de um limite fixo menos gerações consumidas; não existe livro-caixa de créditos.
- `unknown`: preço, quantidade e margem dos novos pacotes.

## Assimetria

A plataforma já possui geração, biblioteca, player, capa, Pix e entrega de acesso. O gargalo dominante não é falta de capacidade técnica: é uma experiência organizada como curso e conversa, enquanto a receita desejada depende de criação repetida.

## Rota

1. Reduzir a navegação a Início, Criar e Biblioteca.
2. Substituir o chat pelo Criador Express.
3. Integrar capa, escolha e lançamento ao contexto da música.
4. Migrar o saldo fixo para um livro-caixa de créditos.
5. Alterar a home somente depois de configurar a verdade comercial dos pacotes.

## Arquitetura do Criador Express

```text
MOTIVO
→ IDEIA
→ EMOÇÃO
→ ESTILO
→ VOZ
→ CONFIRMAÇÃO DE CUSTO
→ DUAS VERSÕES
→ COMPARAÇÃO
→ CAPA
```

Princípios:

- nenhuma pergunta obrigatória em formato de chat;
- refrão automático por padrão;
- configurações técnicas recolhidas;
- custo visível antes da ação;
- falha restitui saldo;
- resultado e próxima ação permanecem na mesma página.

## Backlog priorizado

### P0 — ativação e receita

1. Criador Express.
2. Navegação essencial.
3. Comparador de duas versões.
4. Refinamentos rápidos.
5. Saldo visível.
6. Livro-caixa de créditos.
7. Checkout de recarga Pix.
8. Home alinhada à plataforma.

### P1 — retenção

9. Projetos.
10. Favoritas.
11. Árvore de versões.
12. Receitas reutilizáveis.
13. Capa integrada à favorita.
14. Kit de lançamento.
15. Nota de prontidão.

### P2 — diferenciação

16. Entrada por voz.
17. Entrada por imagem.
18. Teste privado de audiência.
19. DNA musical do usuário.
20. Academia contextual com recompensas.

## Money Model

Hipótese recomendada, ainda não aprovada:

- acesso à plataforma e curso incluído;
- primeira vitória por créditos promocionais controlados;
- cada rodada entrega duas músicas e custa dois créditos;
- pacotes de créditos comprados por Pix;
- confirmação do webhook credita o saldo de forma idempotente;
- sem assinatura inicialmente.

Não publicar valores antes de conhecer custo unitário, margem desejada e quantidade de créditos por pacote.

## Arquitetura da carteira

Substituir o saldo derivado por eventos imutáveis:

```text
CREDIT_PURCHASE
CREDIT_BONUS
CREDIT_CONSUMPTION
CREDIT_REFUND
CREDIT_ADJUSTMENT
```

Cada evento precisa de:

- identificador idempotente;
- comprador/acesso;
- quantidade;
- origem;
- pedido Pix relacionado quando existir;
- data;
- saldo resultante auditável.

## Auditoria obrigatória da home

- remover preço antigo da landing, checkout, termos, telemetria e Lambda;
- posicionar plataforma como produto e curso como benefício;
- tornar preços e pacotes uma configuração do backend;
- explicar custo de cada ação;
- separar inscrição, ativação e recarga;
- atualizar garantia, reembolso e regras de saldo;
- medir visita, cadastro, primeira geração, saldo baixo, Pix criado, Pix pago e nova geração.

## Experimento

Hipótese: escolhas visuais em uma tela aumentarão a passagem de abertura do criador para geração confirmada ao reduzir carga cognitiva.

- baseline: ainda não observado para o novo evento;
- janela: 100 sessões autenticadas;
- métrica primária: `music_generation_confirmed / music_creator_opened`;
- guardrails: erro, restituição, tempo até geração e suporte;
- decisão: manter, ajustar ou retirar depois da janela.
