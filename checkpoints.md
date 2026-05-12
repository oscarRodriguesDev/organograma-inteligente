# Checkpoints do Projeto

> Use `git checkout <tag>` para voltar a um checkpoint.

## Checkpoints

| # | Tag | Descrição | Status |
|---|-----|-----------|--------|
| 1 | `v0.1-inicio` | Projeto Next.js inicializado com TypeScript, Tailwind, ESLint | ✅ |
| 2 | `v0.2-cadastro-colaboradores` | Cadastro de colaboradores com nome, função e líder imediato. CRUD via Server Actions com JSON. | ✅ |
| 3 | `v0.3-avaliacoes` | Sistema de avaliação de desempenho: líder avaliando liderado com 6 critérios (1-5) e comentário. | ✅ |
| 4 | `v0.4-iniciativas` | Registro de iniciativas dos colaboradores (ideias/ações com resultado) para pontuar crescimento. | ✅ |
| 4.1 | `v0.4.1-iniciativas-numericas` | Iniciativas com resultado numérico mensurável e unidade de medida. | ✅ |
| 5 | `v0.5-metricas` | Métricas mensais: dias trabalhados, faltas injustificadas, atrasos. Indicador de perfil do colaborador. | ✅ |
| 6 | `v0.6-seed` | Seed de 100 colaboradores com hierarquia, 2 meses de métricas/avaliações e 33 iniciativas mock. | ✅ |
| 7 | `v0.7-organograma` | Organograma interativo com React Flow (@xyflow/react). Layout hierárquico automático, pan, zoom, minimapa. | ✅ |
| 7.1 | `v0.7.1-organograma-fix` | Fix: container React Flow com width/height explícitos para evitar erro #004. | ✅ |
| 8 | `v0.8-organograma-interativo` | Organograma em árvore expansível: clique para expandir/recolher subordinados. Nós móveis (arrastar), editáveis (duplo clique inline), adicionar subordinado (modal) e excluir com transferência de subordinados. Navegação progressiva (CEO inicial → expansão por níveis). | ✅ |

## Próximos checkpoints previstos
- `v0.9-melhorias-ux` — Animações, filtros, busca, temas
