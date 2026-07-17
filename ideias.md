# 💡 Ideias de Melhoria — Organograma Inteligente

> Arquivo criado em: 16/07/2026
> Última atualização: 16/07/2026 — Fase 1 implementada ✅

---

## 🤖 Integração de IA Generativa

### Contexto
O sistema atualmente é 100% determinístico (regras fixas, score linear). Não há dependências de IA/LLM.
Análise feita em conjunto com agentes `analista-requisitos` e `arquiteto-software`.

---

### 🔴 Prioridade Alta — Fase 1 ✅ (Implementada em 16/07/2026)

| Caso | Status | Detalhes |
|---|---|---|
| 1. Sugestão Inteligente de Candidatos | ✅ | Integrado no OrganogramaFlow. FF: `FF_AI_SUGESTAO_CANDIDATOS` |
| 2. Geração de Feedback em Avaliações | ✅ | Botão "Gerar Feedback com IA" em `/avaliacoes/nova`. FF: `FF_AI_FEEDBACK_AVALIACAO` |
| 3. Redação Assistida de Iniciativas | ✅ | Botão "Sugerir com IA" em `/iniciativas/nova`. FF: `FF_AI_INICIATIVA` |
| 4. Análise de Sentimento | ✅ | Badge "🧠 Sentimento" em `/avaliacoes`. FF: `FF_AI_SENTIMENTO` |

**Provider:** NVIDIA API (`meta/llama-3.1-8b-instruct`)
**Infra:** `src/lib/ai/`, tabela `AILog`, feature flags, fallbacks, API routes
**Build:** ✅ Passou sem erros

---

#### 1. Sugestão Inteligente de Candidatos a Promoção
- **Problema:** Score atual é fórmula linear fixa que ignora dados qualitativos (comentários, trajetória)
- **Solução:** IA analisa comentários de avaliações + iniciativas + trajetória do colaborador para ranquear candidatos com justificativa textual
- **Fallback:** Score determinístico atual (já existe)
- **Complexidade:** Média
- **Provedor:** OpenAI `gpt-4o-mini` (~$0.002/req)
- **Arquitetura:** `src/lib/ai/sugerir-candidatos.ts` — merge do resultado da IA com score existente

#### 2. Geração de Feedback em Avaliações
- **Problema:** Campo "comentário geral" livre — líderes escrevem pouco ou nada
- **Solução:** IA rascunha comentário automático baseado nas notas dos 6 critérios. Usuário edita se quiser.
- **Complexidade:** Baixa
- **Provedor:** Ollama local `llama3.2:3b` (dados sensíveis — avaliações)
- **Arquitetura:** Botão "Gerar comentário" no formulário de avaliação → chama IA via Server Action

#### 3. Redação Assistida de Iniciativas
- **Problema:** Campos de texto livre (título, descrição, resultado) — registros inconsistentes
- **Solução:** IA expande esboço em texto estruturado (problema → ação → resultado). Sugere métrica.
- **Complexidade:** Baixa
- **Provedor:** OpenAI `gpt-4o-mini`
- **Arquitetura:** Botão "Sugerir descrição" no formulário de iniciativa

#### 4. Análise de Sentimento e Padrões em Comentários
- **Problema:** Comentários de avaliações e observações de métricas acumulam texto não analisado
- **Solução:** IA analisa sentimento (positivo/negativo/neutro) ao longo do tempo, detecta padrões textuais de risco
- **Complexidade:** Média
- **Provedor:** Ollama local (dados sensíveis)
- **Arquitetura:** Batch sob demanda ou lazy analysis na página de detalhes do colaborador

---

### 🟡 Prioridade Média — Fase 2

#### 5. Detecção Preditiva de Risco
- Análise de série temporal: tendências em avaliações, correlações absenteísmo-performance
- Requer 12+ meses de dados históricos
- **Complexidade:** Alta

#### 6. Geração de Relatórios de Desempenho
- Relatório narrativo por colaborador, resumo executivo por time, relatório de sucessão
- **Complexidade:** Média

#### 7. Classificação Automática de Iniciativas
- Categorizar em: redução de custo, inovação, melhoria de processo, compliance
- **Complexidade:** Baixa

---

### 🟢 Prioridade Baixa — Fase 3

#### 8. Assistente Conversacional no Modo Simulação
- "Demita o João e veja quem substitui" — NLP + tool calling sobre o estado da simulação
- Requer estado de sessão (Redis), complexidade alta

#### 9. Sumarização de Avaliações 360°
- Compilado narrativo para o colaborador: pontos fortes, áreas de melhoria, evolução

#### 10. Sugestão de Estrutura Organizacional
- Identificar span of control alto, gaps de cobertura, agrupamentos lógicos

#### 11. Job Description para Cargos Vagos
- Gerar descrição de vaga baseada em função, subordinados, perfil do antigo ocupante

#### 12. Chatbot de Consulta ao Organograma
- "Quem é o líder do João?" / "Quem está pronto para promoção?"

---

### 🏗️ Arquitetura Recomendada

```
src/lib/ai/
├── client.ts              # Cliente LLM genérico (abstrai provedor)
├── providers/
│   ├── openai.ts          # gpt-4o-mini (uso geral)
│   └── ollama.ts          # Modelo local (dados sensíveis)
├── prompts/
│   ├── gerar-feedback-avaliacao.ts
│   ├── sugerir-candidatos.ts
│   └── analisar-sentimento.ts
├── cache.ts               # Cache de respostas (tabela própria ou reuso Impacto)
├── fallbacks.ts           # Fallback determinístico quando LLM falha
└── index.ts
```

### Provedores por Caso de Uso

| Caso | Provedor | Modelo | Custo/req |
|---|---|---|---|
| Sugestão candidatos | OpenAI | `gpt-4o-mini` | ~$0.002 |
| Feedback avaliações | Ollama (local) | `llama3.2:3b` | $0 |
| Iniciativas | OpenAI | `gpt-4o-mini` | ~$0.001 |
| Análise sentimento | Ollama (local) | `llama3.2:3b` | $0 |
| Relatórios | OpenAI | `gpt-4o` | ~$0.07 |

### Feature Flags
Usar env vars para liberar gradualmente:
- `FF_AI_SUGESTAO_CANDIDATOS`
- `FF_AI_RESUMO_AVALIACAO`
- `FF_AI_ANALISE_SENTIMENTO`
- etc.

### Custos Estimados
~$15-25/mês com uso moderado (OpenAI gpt-4o-mini + Ollama local para o grosso).

### Riscos
1. **Alucinação** → IA só sugere, não executa. Fallback determinístico sempre.
2. **LGPD** → Dados PII/comentários vão para modelo local; OpenAI anonimizado.
3. **Dependência externa** → Fallback + cache. Se API cair, sistema funciona sem IA.
4. **Latência** → Cache de 1h + indicador de loading + streaming.

---

### 📝 Notas da Análise
- Data: 16/07/2026
- Agentes consultados: `analista-requisitos`, `arquiteto-software`, `explore` (mapeamento do código)
- Decisão: Pendente — aguardando aprovação do usuário para iniciar Fase 1
