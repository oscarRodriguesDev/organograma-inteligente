'use server'

import { prisma } from '@/lib/prisma'
import { analisarImpacto, analisarImpactoAction, type AnaliseImpacto, type TipoAcao } from '@/lib/agents/analista_de_impacto'

/**
 * Busca uma análise de impacto salva no banco.
 * Retorna null se não existir.
 */
export async function obterAnaliseImpacto(
  colaboradorId: string,
  tipoAcao: TipoAcao
): Promise<AnaliseImpacto | null> {
  try {
    const registro = await prisma.analiseImpactoIA.findUnique({
      where: {
        colaboradorId_tipoAcao: { colaboradorId, tipoAcao },
      },
    })
    if (!registro) return null
    return JSON.parse(registro.resultado) as AnaliseImpacto
  } catch {
    return null
  }
}

/**
 * Salva (ou atualiza) uma análise de impacto no banco.
 */
export async function salvarAnaliseImpacto(
  colaboradorId: string,
  tipoAcao: TipoAcao,
  resultado: AnaliseImpacto
): Promise<void> {
  try {
    await prisma.analiseImpactoIA.upsert({
      where: {
        colaboradorId_tipoAcao: { colaboradorId, tipoAcao },
      },
      update: {
        resultado: JSON.stringify(resultado),
      },
      create: {
        colaboradorId,
        tipoAcao,
        resultado: JSON.stringify(resultado),
      },
    })
  } catch (err) {
    console.error('[analise-impacto-actions] erro ao salvar:', err)
  }
}

/**
 * Gera uma nova análise (ignorando cache) e salva no banco.
 * Retorna a análise gerada.
 */
export async function gerarNovaAnaliseImpacto(
  colaboradorId: string,
  tipoAcao: TipoAcao
): Promise<{ sucesso: boolean; dados?: AnaliseImpacto; erro?: string }> {
  const result = await analisarImpactoAction(colaboradorId, tipoAcao)
  if (result.sucesso && result.dados) {
    await salvarAnaliseImpacto(colaboradorId, tipoAcao, result.dados)
  }
  return result
}

/**
 * Obtém uma análise do banco ou, se não existir, gera e salva.
 */
export async function obterOuGerarAnaliseImpacto(
  colaboradorId: string,
  tipoAcao: TipoAcao
): Promise<{ sucesso: boolean; dados?: AnaliseImpacto; erro?: string; fonte: 'cache' | 'nova' }> {
  // Tenta buscar do cache
  const cache = await obterAnaliseImpacto(colaboradorId, tipoAcao)
  if (cache) {
    return { sucesso: true, dados: cache, fonte: 'cache' }
  }

  // Não achou no cache — gera nova
  const result = await analisarImpactoAction(colaboradorId, tipoAcao)
  if (result.sucesso && result.dados) {
    await salvarAnaliseImpacto(colaboradorId, tipoAcao, result.dados)
    return { sucesso: true, dados: result.dados, fonte: 'nova' }
  }

  return { sucesso: false, erro: result.erro, fonte: 'nova' }
}
