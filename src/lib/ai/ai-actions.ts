'use server'

/**
 * Server Actions de IA — cada caso de uso da Fase 1.
 *
 * Todas têm fallback determinístico: se IA falhar ou FF desligada,
 * retorna o resultado baseado em regras (como antes).
 */

import { prisma } from '@/lib/prisma'
import { callAI } from './client'
import { getCachedResponse, setCachedResponse } from './cache'
import {
  fallbackSugerirCandidatos,
  fallbackGerarFeedback,
  fallbackSugerirIniciativa,
  fallbackAnalisarSentimento,
} from './fallbacks'
import {
  SUGERIR_CANDIDATOS_SYSTEM_PROMPT,
  montarPromptCandidatos,
  GERAR_FEEDBACK_SYSTEM_PROMPT,
  montarPromptFeedback,
  SUGERIR_INICIATIVA_SYSTEM_PROMPT,
  montarPromptIniciativa,
  ANALISAR_SENTIMENTO_SYSTEM_PROMPT,
  montarPromptSentimento,
} from './index'
import { isFeatureEnabled } from '@/lib/features'
import { obterSubordinados, mediaAvaliacoes, perfilColaborador } from '@/lib/simulacao'

// ─── Utilitário de log ─────────────────────────────────

async function logChamada(params: {
  casoUso: string
  model: string
  tokensIn: number
  tokensOut: number
  latencyMs: number
  erro?: string
  resposta?: string
  cacheKey?: string
}) {
  try {
    await prisma.impacto.create({ data: params })
  } catch {
    // Log não crítico — não quebra a funcionalidade
  }
}

// ═══════════════════════════════════════════════════════════
// CASO 1: SUGESTÃO INTELIGENTE DE CANDIDATOS
// ═══════════════════════════════════════════════════════════

export type CandidatoComIA = {
  id: string
  nome: string
  funcao: string
  score: number
  scoreIA?: number
  justificativa: string
  mediaAvaliacoes: number
  perfil: string
  qtdSubordinados: number
}

export async function sugerirCandidatosComIA(
  cargoVago: string,
  liderVagoId: string
): Promise<{ candidatos: CandidatoComIA[]; usouIA: boolean }> {
  const base = await prisma.colaborador.findMany({ where: { status: 'ativo' } })
  const colaboradores = base.map((c: any) => ({
    id: c.id,
    nome: c.nome,
    funcao: c.funcao,
    liderImediatoId: c.liderImediatoId,
    status: c.status as string,
  }))

  // Filtra descendentes do cargo vago
  const candidatosBrutos = obterDescendentes(colaboradores, liderVagoId)

  if (candidatosBrutos.length === 0) {
    return { candidatos: [], usouIA: false }
  }

  // Carrega dados para score
  const todasAvaliacoes = await prisma.avaliacao.findMany()
  const avaliacoes = todasAvaliacoes.map((a: any) => ({
    ...a,
    criterios: JSON.parse(a.criterios),
  }))
  const metricas = await prisma.metricaMensal.findMany()

  if (!isFeatureEnabled('ai-sugestao-candidatos')) {
    // Fallback determinístico
    const fallback = fallbackSugerirCandidatos(
      candidatosBrutos as any,
      avaliacoes as any,
      metricas as any,
      colaboradores as any
    )
    return {
      candidatos: fallback.map((f) => ({
        id: f.colaborador.id,
        nome: f.colaborador.nome,
        funcao: f.colaborador.funcao,
        score: f.score,
        justificativa: f.justificativa,
        mediaAvaliacoes: mediaAvaliacoes(avaliacoes as any, f.colaborador.id),
        perfil: perfilColaborador(metricas as any, f.colaborador.id),
        qtdSubordinados: obterSubordinados(colaboradores as any, f.colaborador.id).length,
      })),
      usouIA: false,
    }
  }

  // Monta dados para IA
  const dadosCandidatos = candidatosBrutos.map((c: any) => ({
    id: c.id,
    nome: c.nome,
    funcao: c.funcao,
    mediaAvaliacoes: mediaAvaliacoes(avaliacoes as any, c.id),
    perfil: perfilColaborador(metricas as any, c.id),
    qtdSubordinados: obterSubordinados(colaboradores as any, c.id).length,
    comentarios: avaliacoes
      .filter((a: any) => a.avaliadoId === c.id && a.comentarioGeral)
      .map((a: any) => a.comentarioGeral),
  }))

  const userMessage = montarPromptCandidatos(cargoVago, dadosCandidatos)

  // Tenta cache
  const cached = await getCachedResponse(SUGERIR_CANDIDATOS_SYSTEM_PROMPT, userMessage)
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed)) {
        const candidatos = mergeComScoreDeterministico(parsed, dadosCandidatos, avaliacoes, metricas, colaboradores)
        return { candidatos, usouIA: true }
      }
    } catch {
      // Cache inválido, ignora
    }
  }

  // Chama IA
  try {
    const start = Date.now()
    const response = await callAI({
      messages: [
        { role: 'system', content: SUGERIR_CANDIDATOS_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2,
      maxTokens: 2048,
      jsonMode: true,
    })

    await logChamada({
      casoUso: 'sugerir_candidatos',
      model: response.model,
      tokensIn: response.usage.promptTokens,
      tokensOut: response.usage.completionTokens,
      latencyMs: response.latencyMs,
    })

    // Cache
    await setCachedResponse(SUGERIR_CANDIDATOS_SYSTEM_PROMPT, userMessage, response.content, {
      model: response.model,
      promptTokens: response.usage.promptTokens,
      completionTokens: response.usage.completionTokens,
      latencyMs: response.latencyMs,
    })

    const parsed = JSON.parse(response.content)
    if (Array.isArray(parsed)) {
      const candidatos = mergeComScoreDeterministico(parsed, dadosCandidatos, avaliacoes, metricas, colaboradores)
      return { candidatos, usouIA: true }
    }
  } catch (err: any) {
    await logChamada({
      casoUso: 'sugerir_candidatos',
      model: 'erro',
      tokensIn: 0,
      tokensOut: 0,
      latencyMs: 0,
      erro: err.message,
    })
  }

  // Fallback em caso de erro
  const fallback = fallbackSugerirCandidatos(
    candidatosBrutos as any,
    avaliacoes as any,
    metricas as any,
    colaboradores as any
  )
  return {
    candidatos: fallback.map((f) => ({
      id: f.colaborador.id,
      nome: f.colaborador.nome,
      funcao: f.colaborador.funcao,
      score: f.score,
      justificativa: f.justificativa,
      mediaAvaliacoes: mediaAvaliacoes(avaliacoes as any, f.colaborador.id),
      perfil: perfilColaborador(metricas as any, f.colaborador.id),
      qtdSubordinados: obterSubordinados(colaboradores as any, f.colaborador.id).length,
    })),
    usouIA: false,
  }
}

function obterDescendentes(colaboradores: any[], id: string): any[] {
  const result: any[] = []
  const visitados = new Set<string>()
  function dfs(pid: string) {
    if (visitados.has(pid)) return
    visitados.add(pid)
    for (const c of colaboradores.filter((c: any) => c.liderImediatoId === pid)) {
      result.push(c)
      dfs(c.id)
    }
  }
  dfs(id)
  return result
}

function mergeComScoreDeterministico(
  iaResult: any[],
  dadosCandidatos: any[],
  avaliacoes: any[],
  metricas: any[],
  colaboradores: any[]
): CandidatoComIA[] {
  return iaResult.map((item: any) => {
    const dados = dadosCandidatos.find((d) => d.id === item.id)
    const scoreDeterministico = dados
      ? dados.mediaAvaliacoes * 2 +
        (dados.perfil === 'Bom' ? 1.5 : dados.perfil === 'Ruim' ? -1 : 0) +
        dados.qtdSubordinados * 0.5
      : 0

    return {
      id: item.id,
      nome: dados?.nome || '',
      funcao: dados?.funcao || '',
      score: scoreDeterministico,
      scoreIA: item.score,
      justificativa: item.justificativa || '',
      mediaAvaliacoes: dados?.mediaAvaliacoes || 0,
      perfil: dados?.perfil || 'desconhecido',
      qtdSubordinados: dados?.qtdSubordinados || 0,
    }
  }).sort((a: CandidatoComIA, b: CandidatoComIA) => (b.scoreIA ?? b.score) - (a.scoreIA ?? a.score))
}

// ═══════════════════════════════════════════════════════════
// CASO 2: GERAÇÃO DE FEEDBACK EM AVALIAÇÕES
// ═══════════════════════════════════════════════════════════

export async function gerarFeedbackIA(
  avaliadorId: string,
  avaliadoId: string,
  criterios: Array<{ criterio: string; nota: number }>
): Promise<{ feedback: string; usouIA: boolean }> {
  // Busca dados para contexto
  const [avaliador, avaliado] = await Promise.all([
    prisma.colaborador.findUnique({ where: { id: avaliadorId } }),
    prisma.colaborador.findUnique({ where: { id: avaliadoId } }),
  ])

  if (!avaliador || !avaliado) {
    return {
      feedback: fallbackGerarFeedback(criterios),
      usouIA: false,
    }
  }

  if (!isFeatureEnabled('ai-feedback-avaliacao')) {
    return {
      feedback: fallbackGerarFeedback(criterios),
      usouIA: false,
    }
  }

  const userMessage = montarPromptFeedback(
    avaliado.nome,
    criterios,
    avaliado.funcao,
    avaliador.funcao
  )

  try {
    const response = await callAI({
      messages: [
        { role: 'system', content: GERAR_FEEDBACK_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      maxTokens: 512,
    })

    await logChamada({
      casoUso: 'feedback_avaliacao',
      model: response.model,
      tokensIn: response.usage.promptTokens,
      tokensOut: response.usage.completionTokens,
      latencyMs: response.latencyMs,
    })

    return { feedback: response.content.trim(), usouIA: true }
  } catch (err: any) {
    await logChamada({
      casoUso: 'feedback_avaliacao',
      model: 'erro',
      tokensIn: 0,
      tokensOut: 0,
      latencyMs: 0,
      erro: err.message,
    })

    return { feedback: fallbackGerarFeedback(criterios), usouIA: false }
  }
}

// ═══════════════════════════════════════════════════════════
// CASO 3: REDAÇÃO ASSISTIDA DE INICIATIVAS
// ═══════════════════════════════════════════════════════════

export type IniciativaSugerida = {
  titulo: string
  descricao: string
  resultado: string
  unidadeMedidaSugerida: string | null
}

export async function sugerirIniciativaIA(
  colaboradorId: string,
  esboco: string
): Promise<{ sugestao: IniciativaSugerida; usouIA: boolean }> {
  const colaborador = await prisma.colaborador.findUnique({ where: { id: colaboradorId } })

  if (!colaborador) {
    const fallback = fallbackSugerirIniciativa(esboco)
    return { sugestao: { ...fallback, unidadeMedidaSugerida: null }, usouIA: false }
  }

  if (!isFeatureEnabled('ai-iniciativa')) {
    const fallback = fallbackSugerirIniciativa(esboco)
    return { sugestao: { ...fallback, unidadeMedidaSugerida: null }, usouIA: false }
  }

  const userMessage = montarPromptIniciativa(colaborador.nome, colaborador.funcao, esboco)

  try {
    const response = await callAI({
      messages: [
        { role: 'system', content: SUGERIR_INICIATIVA_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      maxTokens: 1024,
      jsonMode: true,
    })

    await logChamada({
      casoUso: 'iniciativa',
      model: response.model,
      tokensIn: response.usage.promptTokens,
      tokensOut: response.usage.completionTokens,
      latencyMs: response.latencyMs,
    })

    const parsed = JSON.parse(response.content)
    return {
      sugestao: {
        titulo: parsed.titulo || esboco.slice(0, 80),
        descricao: parsed.descricao || esboco,
        resultado: parsed.resultado || '',
        unidadeMedidaSugerida: parsed.unidadeMedidaSugerida || null,
      },
      usouIA: true,
    }
  } catch (err: any) {
    await logChamada({
      casoUso: 'iniciativa',
      model: 'erro',
      tokensIn: 0,
      tokensOut: 0,
      latencyMs: 0,
      erro: err.message,
    })

    const fallback = fallbackSugerirIniciativa(esboco)
    return { sugestao: { ...fallback, unidadeMedidaSugerida: null }, usouIA: false }
  }
}

// ═══════════════════════════════════════════════════════════
// CASO 4: ANÁLISE DE SENTIMENTO
// ═══════════════════════════════════════════════════════════

export type AnaliseSentimento = {
  sentimento: 'positivo' | 'negativo' | 'neutro'
  score: number
  insights: string[]
}

export async function analisarSentimentoIA(
  colaboradorId: string
): Promise<{ analise: AnaliseSentimento; usouIA: boolean }> {
  const colaborador = await prisma.colaborador.findUnique({ where: { id: colaboradorId } })
  if (!colaborador) {
    return { analise: fallbackAnalisarSentimento([]), usouIA: false }
  }

  // Coleta todos os textos do colaborador
  const [avaliacoesRecebidas, metricas, iniciativas] = await Promise.all([
    prisma.avaliacao.findMany({ where: { avaliadoId: colaboradorId } }),
    prisma.metricaMensal.findMany({ where: { colaboradorId } }),
    prisma.iniciativa.findMany({ where: { colaboradorId } }),
  ])

  const comentarios: Array<{ tipo: 'avaliacao' | 'observacao_metrica' | 'iniciativa'; texto: string; data?: string }> = [
    ...avaliacoesRecebidas
      .filter((a) => a.comentarioGeral)
      .map((a) => ({ tipo: 'avaliacao' as const, texto: a.comentarioGeral, data: a.data.toISOString() })),
    ...metricas
      .filter((m) => m.observacao)
      .map((m) => ({ tipo: 'observacao_metrica' as const, texto: m.observacao, data: `${m.mes}/${m.ano}` })),
    ...iniciativas
      .filter((i) => i.descricao || i.resultado)
      .map((i) => ({ tipo: 'iniciativa' as const, texto: `${i.titulo}: ${i.descricao} ${i.resultado}`.trim(), data: i.data.toISOString() })),
  ]

  if (comentarios.length === 0) {
    return {
      analise: { sentimento: 'neutro', score: 0.5, insights: ['Colaborador sem comentários registrados.'] },
      usouIA: false,
    }
  }

  if (!isFeatureEnabled('ai-sentimento')) {
    return { analise: fallbackAnalisarSentimento(comentarios.map((c) => c.texto)), usouIA: false }
  }

  const userMessage = montarPromptSentimento(colaborador.nome, comentarios)

  try {
    const response = await callAI({
      messages: [
        { role: 'system', content: ANALISAR_SENTIMENTO_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2,
      maxTokens: 1024,
      jsonMode: true,
    })

    await logChamada({
      casoUso: 'sentimento',
      model: response.model,
      tokensIn: response.usage.promptTokens,
      tokensOut: response.usage.completionTokens,
      latencyMs: response.latencyMs,
    })

    const parsed = JSON.parse(response.content)
    return {
      analise: {
        sentimento: parsed.sentimento || 'neutro',
        score: typeof parsed.score === 'number' ? parsed.score : 0.5,
        insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      },
      usouIA: true,
    }
  } catch (err: any) {
    await logChamada({
      casoUso: 'sentimento',
      model: 'erro',
      tokensIn: 0,
      tokensOut: 0,
      latencyMs: 0,
      erro: err.message,
    })

    return { analise: fallbackAnalisarSentimento(comentarios.map((c) => c.texto)), usouIA: false }
  }
}
