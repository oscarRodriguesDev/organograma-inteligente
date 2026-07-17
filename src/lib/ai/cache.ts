/**
 * Cache de respostas da IA.
 *
 * Estratégia:
 *   - Cacheia por hash (systemPrompt + última mensagem do usuário)
 *   - TTL: 1 hora
 *   - Usa o banco SQLite (tabela AILog) como armazenamento KV
 *   - Invalidação manual: o usuário pode clicar "Regenerar" para bypassar o cache
 */

import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'

function hashKey(systemPrompt: string, userMessage: string): string {
  return createHash('sha256')
    .update(systemPrompt + '|||' + userMessage)
    .digest('hex')
    .slice(0, 32)
}

export async function getCachedResponse(
  systemPrompt: string,
  userMessage: string
): Promise<string | null> {
  const key = hashKey(systemPrompt, userMessage)
  const entry = await prisma.impacto.findFirst({
    where: { cacheKey: key, erro: null },
    orderBy: { createdAt: 'desc' },
  })

  if (!entry) return null

  // Verifica TTL de 1 hora
  const elapsed = Date.now() - new Date(entry.createdAt).getTime()
  if (elapsed > 60 * 60 * 1000) {
    // Expirado — deleta e retorna null
    await prisma.impacto.delete({ where: { id: entry.id } })
    return null
  }

  return entry.resposta ?? null
}

export async function setCachedResponse(
  systemPrompt: string,
  userMessage: string,
  resposta: string,
  metadata: {
    model: string
    promptTokens: number
    completionTokens: number
    latencyMs: number
  }
): Promise<void> {
  const key = hashKey(systemPrompt, userMessage)

  await prisma.impacto.create({
    data: {
      cacheKey: key,
      casoUso: 'cache',
      provider: 'nvidia',
      model: metadata.model,
      tokensIn: metadata.promptTokens,
      tokensOut: metadata.completionTokens,
      latencyMs: metadata.latencyMs,
      resposta,
    },
  })
}

/**
 * Gera uma chave de cache para debug/invalidação manual.
 */
export function getCacheKey(systemPrompt: string, userMessage: string): string {
  return hashKey(systemPrompt, userMessage)
}
