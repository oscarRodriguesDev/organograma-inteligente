// ─── Cliente ───────────────────────────────────────────
export { callAI, getNvidiaKey, setNvidiaKey } from './client'
export type { AIRequest, AIResponse, AIProvider } from './client'

// ─── Cache ─────────────────────────────────────────────
export { getCachedResponse, setCachedResponse, getCacheKey } from './cache'

// ─── Fallbacks ─────────────────────────────────────────
export {
  fallbackSugerirCandidatos,
  fallbackGerarFeedback,
  fallbackSugerirIniciativa,
  fallbackAnalisarSentimento,
} from './fallbacks'

// ─── Prompts (system prompts) ──────────────────────────
export { SUGERIR_CANDIDATOS_SYSTEM_PROMPT, montarPromptCandidatos } from './prompts/sugerir-candidatos'
export { GERAR_FEEDBACK_SYSTEM_PROMPT, montarPromptFeedback } from './prompts/gerar-feedback'
export { SUGERIR_INICIATIVA_SYSTEM_PROMPT, montarPromptIniciativa } from './prompts/sugerir-iniciativa'
export { ANALISAR_SENTIMENTO_SYSTEM_PROMPT, montarPromptSentimento } from './prompts/analisar-sentimento'
