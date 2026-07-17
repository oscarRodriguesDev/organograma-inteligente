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

| 9 | `v0.9-simulacao-impacto` | Modo simulação: demissão, promoção com efeito cascata, impacto automático (positivo/negativo), indicador de alerta, modal de impactos, regras de impacto customizáveis. | ✅ |
| 10 | `v0.10-promocao-subordinados` | Demissão mantém subordinados sob VAGO (edges preservadas); promoção filtra candidatos para subordinados/descendentes apenas; novos impactos: salto hierárquico, ex-colega vira subordinado, cascata excessiva. | ✅ |

| 10.1 | `v0.10.1-relocar-normal` | Botão ⟷ adicionado ao modo normal (não só simulação). Ao adicionar subordinado, checkbox "Transferir subordinados atuais" para inserir gestor entre níveis. ↑ em líder cujo chefe é VAGO redireciona para preencher vaga. | ✅ |
| 10.2 | `v0.10.2-edges-reconnectaveis` | Edges do organograma são reconectáveis: clique na seta (edge) abre modal de relocar. Drag & drop de edge removido (instável no React Flow v12.10.2). Botão ⟷ e clique na conexão disponíveis em ambos os modos. Proteção contra ciclos em DFS/loops para evitar travamentos. | ✅ |

| 11 | `v0.11-ia-fase1` | Integração de IA generativa via NVIDIA API (Fase 1): sugestão inteligente de candidatos, geração de feedback em avaliações, redação assistida de iniciativas, análise de sentimento em comentários. Infraestrutura: src/lib/ai/, tabela AILog, feature flags, fallbacks determinísticos. | ✅ |
| 12 | `v0.12-novas-ferramentas-rh` | Fit Cultural, Teste DISC, Pesquisa de Sentimento, Registro de Conversas, navegação, correção `prisma.aILog` → `prisma.impacto` | ✅ |

## Próximos checkpoints previstos
- `v0.13-melhorias-ux` — Animações, filtros, busca, temas
