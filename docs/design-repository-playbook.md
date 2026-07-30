# Repositórios de design para acelerar a musicacom.ia

Este documento define as fontes open source que podem acelerar a evolução visual
do produto sem descaracterizar a marca nem adicionar dependências por impulso.

## Base recomendada

| Repositório | Melhor uso no produto | Estratégia | Licença |
| --- | --- | --- | --- |
| [lucide-icons/lucide](https://github.com/lucide-icons/lucide) | Ícones consistentes no estúdio, biblioteca, player e formulários | Dependência oficial `lucide-react`; já adotada na área autenticada | ISC |
| [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | Estrutura de sidebar, dialogs, sheets, dropdowns e estados de formulário | Copiar apenas o componente necessário e adaptar aos tokens da musicacom.ia | MIT |
| [radix-ui/primitives](https://github.com/radix-ui/primitives) | Comportamento acessível de modal, menu, tooltip, tabs e popover | Usar como fundação quando o componente exigir teclado, foco e ARIA complexos | MIT |
| [untitleduico/react](https://github.com/untitleduico/react) | Formulários, empty states, tabelas e padrões de aplicação | Fonte preferencial de referência para React 19 + Tailwind 4; adaptar o visual | MIT |
| [magicuidesign/magicui](https://github.com/magicuidesign/magicui) | Destaques de lançamento, brilho sutil, progressive blur e cards especiais | Uso pontual em momentos de encantamento; nunca na navegação inteira | MIT |
| [ibelick/motion-primitives](https://github.com/ibelick/motion-primitives) | Transições de criação, feedback de progresso e troca de estados | Copiar componentes pequenos; revisar porque o projeto ainda está em beta | MIT |
| [tremorlabs/tremor](https://github.com/tremorlabs/tremor) | Futuro painel de métricas, consumo de créditos e funil de músicas | Usar padrões de dados e gráficos, sem importar a aparência completa | Apache-2.0 |
| [storybookjs/storybook](https://github.com/storybookjs/storybook) | Catálogo visual, teste isolado e regressão dos componentes próprios | Adotar quando os componentes-base forem extraídos do CSS global | MIT |
| [storybookjs/mcp](https://github.com/storybookjs/mcp) | Dar aos agentes contexto estruturado sobre os componentes reais | Avaliar junto da adoção do Storybook; exige Node 24+ | MIT |

## Fontes criativas com restrição

- [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits): bom para
  explorar textura, fundos e movimento em campanhas e páginas públicas. A licença
  usa MIT com Commons Clause; revisar antes de incorporar código e não usar como
  fundação do produto.
- [cosscom/coss](https://github.com/cosscom/coss): excelente referência para
  componentes de aplicação. O repositório possui licença mista; somente as áreas
  explicitamente MIT podem ser reutilizadas.

## Regra de adoção

1. Resolver primeiro com os componentes e tokens existentes.
2. Procurar um padrão na lista acima e conferir licença, dependências e
   acessibilidade.
3. Copiar apenas o menor componente útil ou instalar apenas o pacote oficial
   necessário.
4. Adaptar cores, tipografia, raio, densidade e movimento à musicacom.ia.
5. Validar desktop, celular, teclado, foco visível e `prefers-reduced-motion`.

## Ordem prática para este repositório

1. **Agora:** Lucide para consolidar os ícones da área autenticada.
2. **Próximo ciclo:** extrair `Button`, `IconButton`, `Card`, `Badge` e
   `EmptyState` próprios, inspirados em shadcn/ui e Untitled UI.
3. **Quando surgirem menus e modais:** Radix Primitives.
4. **Quando houver uma biblioteca estável de componentes:** Storybook e,
   depois, Storybook MCP.
5. **Em páginas de campanha:** Magic UI ou Motion Primitives, com movimento
   reduzido e sem contaminar a interface operacional.
