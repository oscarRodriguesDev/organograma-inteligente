/**
 * Feature flags — controle de funcionalidades via variáveis de ambiente.
 *
 * Uso:
 *   if (isFeatureEnabled('ai-sugestao-candidatos')) { ... }
 *
 ## Variáveis de ambiente:
 *   FF_AI_SUGESTAO_CANDIDATOS  → "true" ativa sugestão via IA
 *   FF_AI_FEEDBACK_AVALIACAO   → "true" ativa geração de feedback via IA
 *   FF_AI_INICIATIVA           → "true" ativa redação assistida de iniciativas
 *   FF_AI_SENTIMENTO           → "true" ativa análise de sentimento
 *
 * Se não definida, a feature está DESLIGADA (false).
 */

const FEATURE_PREFIX = 'FF_AI_'

const featureEnvMap: Record<string, string> = {
  'ai-sugestao-candidatos': 'SUGESTAO_CANDIDATOS',
  'ai-feedback-avaliacao': 'FEEDBACK_AVALIACAO',
  'ai-iniciativa': 'INICIATIVA',
  'ai-sentimento': 'SENTIMENTO',
}

/**
 * Verifica se uma feature está habilitada.
 * @param feature Nome da feature (ex: "ai-sugestao-candidatos")
 */
export function isFeatureEnabled(feature: string): boolean {
  const envSuffix = featureEnvMap[feature]
  if (!envSuffix) return false

  const envKey = `${FEATURE_PREFIX}${envSuffix}`
  const value = process.env[envKey] || process.env[envKey.toLowerCase()] || ''
  return value === 'true' || value === '1'
}

/**
 * Retorna todas as features disponíveis com seus status.
 */
export function listFeatures(): Record<string, boolean> {
  const result: Record<string, boolean> = {}
  for (const key of Object.keys(featureEnvMap)) {
    result[key] = isFeatureEnabled(key)
  }
  return result
}
