# Memória do Projeto - Organograma Inteligente

## 📌 Sobre
Sistema gerenciador de organogramas de empresas. Permite cadastrar colaboradores, definir hierarquias e visualizar a estrutura organizacional.

## 🧱 Stack
- **Framework:** Next.js 16.2.6
- **React:** 19.2.4
- **Styling:** Tailwind CSS v4
- **Linguagem:** TypeScript
- **Linter:** ESLint (config next)

## 🎯 Escopo Inicial
1. Cadastro de colaboradores (nome, função, líder imediato)
2. Visualização do organograma hierárquico
3. CRUD completo de colaboradores
4. Interface simplificada e intuitiva

## 🧠 Decisões de Arquitetura
- **Armazenamento:** arquivo JSON (`src/data/colaboradores.json`) via Server Actions — sem banco externo para simplificar o protótipo
- **Server Actions:** ações de formulário no servidor com `'use server'`, seguidas de `revalidatePath` e `redirect`
- **Rotas:** `/colaboradores` (listagem), `/colaboradores/novo` (cadastro)
- **Navegação:** header global no layout raiz com links para Organograma, Colaboradores, Avaliações, Iniciativas, Métricas
- **Avaliações:** líder avalia liderado com 6 critérios (nota 1-5) + comentário geral. Armazenamento em JSON separado (`src/data/avaliacoes.json`)
- **Iniciativas:** registro de ideias/ações de colaboradores com descrição, resultado numérico mensurável e unidade. Conta como pontuação para crescimento na empresa. Armazenamento em `src/data/iniciativas.json`
- **Métricas Mensais:** acompanhamento de dias trabalhados, faltas injustificadas e horas de atraso por colaborador/mês. Indicador de perfil (Bom/Ruim) baseado em regras (>2 faltas ou >4h atraso = Ruim). Armazenamento em `src/data/metricas.json`
- **Seed data:** `npm run seed` gera 100 colaboradores com hierarquia realista (CEO → Diretores → Gerentes → Analistas), 2 meses de métricas e avaliações, ~33 iniciativas
- **Organograma interativo:** React Flow (@xyflow/react v12) com layout hierárquico automático. Nós customizados mostrando nome e cargo. Suporte a pan, zoom, minimapa. Rota `/organograma`
- **Organograma em árvore expansível (v0.8):**
  - Estado inicial: apenas o CEO (raiz) visível
  - **Clique** no nó → expande/recolhe seus subordinados diretos
  - **Duplo clique** → edição inline de nome e função
  - **Hover** → botões de ação: `+` adicionar subordinado (modal), `×` excluir (com confirmação)
  - Exclusão transfere subordinados para o líder imediato do excluído
  - Nós são **arrastáveis** livremente no canvas
  - Auto `fitView` ao expandir/recolher
  - Server actions: `atualizarColaboradorAction`, `excluirColaboradorComSubordinados`, `adicionarColaboradorRapido`
- **Modo Simulação de Impacto (v0.9 → v0.10):**
  - Toggle "Simular" no topo do organograma ativa modo de simulação
  - Em modo simulação, botões nos nós mudam para ↓ (simular demissão) e ↑ (simular promoção para cargo vago)
  - **Demissão v0.10:** marca o nó como VAGO (vermelho) mas **NÃO transfere subordinados** — eles ficam sob o VAGO, mantendo as conexões (edges) visíveis. Isso permite "promover de baixo" para preencher a vaga.
  - **Promoção v0.10:** ao preencher VAGO, candidatos são filtrados para **subordinados/descendentes** do cargo vago apenas (não mostra todos os colaboradores ativos). Ordenados por score (avaliações + perfil + subordinados).
  - **Efeito cascata:** promoção gera novo cargo vago na posição antiga do promovido (pode ser preenchido em sequência)
  - **Novos impactos detectados:**
    - **Salto hierárquico** (negativo) — promoção que pula mais de 1 nível — risco do Princípio de Peter
    - **Ex-colega agora é subordinado** (negativo) — par virou chefe — possível tensão no time
    - **Cascata excessiva de VAGOs** (negativo) — 3+ níveis consecutivos de VAGO — desestabilização estrutural
    - **Cadeia de cargos vagos** (negativo) — 2+ VAGOs conectados — risco de propagação
  - **Impactos automáticos:** sistema detecta impactos positivos/negativos baseado em regras (avaliações, perfil, etc.)
  - **Indicador de alerta:** botão flutuante colorido (vermelho se há impactos negativos) mostrando contagem
  - **Modal de impactos:** lista detalhada com todos os impactos, categorizados por tipo
  - **Impactos manuais:** campo para adicionar observações de impacto manualmente
  - **Regras de impacto:** página `/regras-impacto` para CRUD de regras que determinam a detecção automática (inclui novos tipos: `salto_hierarquico`, `ex_colegas_subordinados`, `cascata_excessiva`)
  - **Aplicar simulação:** confirma as alterações no banco (Prisma/Supabase); **Descartar:** reverte tudo
  - Lógica em `src/lib/simulacao.ts`
- **Relocar hierarquia (v0.10.2):** duas formas de religar nós:
  1. Botão **⟷** no hover do nó → modal de relocar
  2. **Clique na seta (edge)** → abre modal de relocar para o subordinado
  - Drag & drop de edge removido (instável no React Flow v12.10.2)
- **Proteção contra ciclos:** `obterDescendentes`, `calcularNivel` e loops de VAGO chain agora têm `Set` de visitados para evitar travamentos em caso de ciclo na hierarquia

## 📂 Estrutura de Diretórios
```
src/
  app/          # App Router do Next.js
```

## 🤖 Integração com IA — Fase 1 (Implementada — Jul/2026)
**Status:** ✅ Implementado. Usando NVIDIA API (`meta/llama-3.1-8b-instruct`).

### O que foi implementado

| # | Caso | O que faz | Onde |
|---|---|---|---|
| 1 | **Sugestão Inteligente de Candidatos** | IA ranqueia candidatos a promoção analisando comentários qualitativos + score determinístico. Fallback: score atual. | OrganogramaFlow (modo simulação) |
| 2 | **Geração de Feedback** | Botão "Gerar Feedback com IA" no formulário de avaliação. Gera comentário geral baseado nas notas. | `/avaliacoes/nova` |
| 3 | **Redação Assistida de Iniciativas** | Botão "Sugerir com IA" no formulário. Expande esboço em título + descrição + resultado estruturado. | `/iniciativas/nova` |
| 4 | **Análise de Sentimento** | Badge "🧠 Sentimento" nos cards de avaliação. Analisa comentários e exifica score + insights. | `/avaliacoes` |

### Arquitetura
```
src/lib/ai/
├── client.ts              # Cliente NVIDIA API (formato OpenAI)
├── providers/
│   └── nvidia.ts          # Constantes de modelos NVIDIA
├── prompts/
│   ├── sugerir-candidatos.ts
│   ├── gerar-feedback.ts
│   ├── sugerir-iniciativa.ts
│   └── analisar-sentimento.ts
├── cache.ts               # Cache via tabela AILog (hash prompt, TTL 1h)
├── fallbacks.ts           # Fallbacks determinísticos (regras atuais)
├── ai-actions.ts          # Server Actions de IA
└── index.ts               # Barrel export

src/app/api/ai/
├── features/route.ts      # GET /api/ai/features
├── sugerir-candidatos/route.ts  # POST
├── feedback/route.ts            # POST
├── iniciativa/route.ts          # POST
└── sentimento/route.ts          # POST
```

### Configuração
- **Provider:** NVIDIA NIM (`meta/llama-3.1-8b-instruct`)
- **Feature flags:** `FF_AI_*` no `.env`
- **Fallback automático:** se IA falhar, volta ao comportamento determinístico
- **Modo mock:** se `NVIDIA_API_KEY` não estiver definida, retorna respostas mock

### Tabela nova no banco
- `AILog` → renomeada para `Impacto` (unificada para auditoria de IA + impactos de simulação)
  - Impactos de simulação armazenados como JSON no campo `resposta` com `casoUso: 'simulacao'`

## ⚠️ Observações
- Next.js 16 tem breaking changes — consultar `node_modules/next/dist/docs/` antes de implementar.

## 🆕 Funcionalidades Implementadas (v0.12)

### 1. Teste Fit Cultural (`/fit-cultural`)
- Lista perguntas ativas com dimensão, peso e ordem
- Formulário de resposta (1-5) por colaborador, agrupado por dimensão
- Server Action que salva respostas e recalcula

### 2. Teste DISC (`/teste-disc`)
- Lista perguntas DISC agrupadas por dimensão (D/I/S/C) com cabeçalhos coloridos
- Formulário de resposta (1-5) por colaborador
- Server Action que calcula automaticamente o perfil DISC (maior pontuação)
- Resultados em `/teste-disc/resultados` com gráfico de barras

### 3. Pesquisa de Sentimento (`/pesquisa-sentimento`)
- Formulário com sentimento geral (emoji), nota, engajamento/motivação/pertencimento (opcionais) e comentário
- Lista pesquisas anteriores em cards com indicador visual

### 4. Registro de Conversas (`/conversas`)
- Listagem com cards, tipo, colaborador, data
- `/conversas/nova` — formulário completo com tipo (1:1, feedback, avaliação, alinhamento, desligamento, outro)
- `/conversas/[id]` — página de detalhes com seções coloridas
- Server Actions para criar e excluir

### 5. Navegação
- Links adicionados no header para Fit Cultural, Teste DISC, Sentimento, Conversas

### 6. Funções de acesso a dados complementares (`src/lib/db.ts`)
Novas funções adicionadas:
- **Fit Cultural:** `obterRespostasFitCultural`, `calcularScoreFitCultural`
- **DISC:** `responderDISC` agora retorna `ResultadoDISC`, `recalcularResultadoDISC`
- **Pesquisa Sentimento:** filtro opcional `colaboradorId` em `listarPesquisasSentimento`, `calcularScoreSentimento`
- **Conversas:** filtro opcional `colaboradorId` em `listarConversas`, `calcularScoreConversas`
- **Score Consolidado:** `calcularEAtualizarScore` (média ponderada dos 7 sub-scores), `obterScore`, `listarScores`

### 7. Script de seed de perguntas (`scripts/seed-testes.ts`)
- Popula 10 perguntas de Fit Cultural (2 por dimensão: valores, comportamento, comunicacao, lideranca, inovacao)
- Popula 16 perguntas de DISC (4 por dimensão: D, I, S, C)
- Idempotente: limpa e recria
- Executar: `npx tsx scripts/seed-testes.ts`

### Correções
- `prisma.aILog` → `prisma.impacto` (modelo renomeado no schema)
- `salvarImpactosSimulacao`/`carregarImpactosSimulacao` adaptados para usar `casoUso: 'simulacao'` com dados serializados em JSON

### 8. Integração Scores ↔ Simulação
- `getDadosSimulacao` agora carrega também `scores` (tabela `ScoreColaborador`)
- `analisarEstadoSimulacao` recebe parâmetro opcional `scores` e gera impactos qualificados:
  - **Score fit baixo** → negativo (desalinhamento cultural)
  - **Score sentimento baixo** → negativo (insatisfação)
  - **Score geral baixo + promoção** → negativo (Princípio de Peter)
  - **Score geral alto + promoção** → positivo (alto potencial)
  - **Score geral alto + demissão** → negativo (perda de talento)
  - **Score cultural alto** → positivo
  - **Conversas regulares** → positivo (engajamento)
- IA considera scores ao sugerir candidatos (Fase 1)
