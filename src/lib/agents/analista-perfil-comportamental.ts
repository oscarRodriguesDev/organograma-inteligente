/**
 * Analista de Perfil Comportamental — Agente de IA para analisar perfis comportamentais
 * de colaboradores e calcular aderência entre líder e equipe.
 *
 * Funcionalidades:
 * 1. analisarPerfilIndividual(colaboradorId) → analisa e salva o perfil comportamental
 * 2. calcularAderenciaLiderEquipe(liderId, timeIds) → calcula compatibilidade
 * 3. sugerirMelhorCandidato(cargoAlvo, candidatosIds, equipeIds) → melhor opção de promoção
 *
 * Uso:
 *   import { analisarPerfilIndividual } from '@/lib/agents/analista-perfil-comportamental'
 *   const resultado = await analisarPerfilIndividual('colaborador-id')
 */

import { prisma } from '@/lib/prisma'
import { callAI } from '@/lib/ai/client'
import {
  ANALISAR_PERFIL_COMPORTAMENTAL_SYSTEM_PROMPT,
  montarPromptAnalisePerfilIndividual,
  montarPromptAderenciaLiderEquipe,
  montarPromptMelhorCandidato,
} from './prompts/analisar-perfil-comportamental'
import {
  listarAvaliacoesPorAvaliado,
  listarConversas,
  listarIniciativasDoColaborador,
  listarMetricasPorColaborador,
} from '@/lib/db'

// ─── Tipos ───────────────────────────────────────────────

export interface AnalisePerfilIndividual {
  perfilResumo: string
  dimensoes: {
    dominancia: { nivel: 'baixo' | 'medio' | 'alto'; descricao: string }
    influencia: { nivel: 'baixo' | 'medio' | 'alto'; descricao: string }
    estabilidade: { nivel: 'baixo' | 'medio' | 'alto'; descricao: string }
    conformidade: { nivel: 'baixo' | 'medio' | 'alto'; descricao: string }
  }
  forcas: string[]
  pontosAtencao: string[]
  estiloLideranca: string
  recomendacaoAmbiente: string
}

export interface AderenciaMembro {
  nome: string
  perfil: string
  aderencia: number // 0-100
  justificativa: string
}

export interface AderenciaLiderEquipe {
  lider: {
    nome: string
    perfil: string
  }
  time: AderenciaMembro[]
  aderenciaGeral: number // 0-100
  analise: string
  riscos: string[]
  oportunidades: string[]
  recomendacao: string
}

export interface CandidatoComparativo {
  nome: string
  perfilResumo: string
  aderenciaEquipe: number // 0-100
  scoreCompatibilidade: number // 0-100
  pontosFortes: string[]
  pontosRisco: string[]
}

export interface MelhorCandidato {
  candidatos: CandidatoComparativo[]
  melhorOpcao: string
  justificativa: string
  scoreComparativo: {
    melhor: number // 0-100
    segundo: number // 0-100
  }
}

// ─── Função principal: analisar perfil individual ────────

export async function analisarPerfilIndividual(
  colaboradorId: string
): Promise<AnalisePerfilIndividual> {
  // 1. Busca dados do colaborador com relacionamentos
  const colaborador = await prisma.colaborador.findUnique({
    where: { id: colaboradorId },
    include: {
      empresa: { select: { nome: true } },
      resultadoDISC: true,
      scores: true,
      fitCulturalRespostas: {
        include: { pergunta: { select: { dimensao: true } } },
      },
    },
  })

  if (!colaborador) {
    throw new Error(`Colaborador ${colaboradorId} não encontrado`)
  }

  // 2. Coleta dados complementares em paralelo
  const [avaliacoes, conversas, iniciativas, metricas] = await Promise.all([
    listarAvaliacoesPorAvaliado(colaboradorId),
    listarConversas(colaboradorId),
    listarIniciativasDoColaborador(colaboradorId),
    listarMetricasPorColaborador(colaboradorId),
  ])

  // 3. Prepara dados de fit cultural agregados
  const fitCultural = colaborador.fitCulturalRespostas.length > 0
    ? colaborador.fitCulturalRespostas.map((r) => ({
        dimensao: r.pergunta.dimensao,
        nota: r.nota,
      }))
    : undefined

  // 4. Monta estrutura para o prompt
  const dadosPrompt = {
    colaborador: {
      nome: colaborador.nome,
      funcao: colaborador.funcao,
      papel: colaborador.papel as string,
      tempoNaEmpresa: colaborador.createdAt
        ? `${Math.floor((Date.now() - new Date(colaborador.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30))} meses`
        : undefined,
    },
    resultadoDISC: colaborador.resultadoDISC
      ? {
          perfil: colaborador.resultadoDISC.perfil,
          pontuacaoD: colaborador.resultadoDISC.pontuacaoD,
          pontuacaoI: colaborador.resultadoDISC.pontuacaoI,
          pontuacaoS: colaborador.resultadoDISC.pontuacaoS,
          pontuacaoC: colaborador.resultadoDISC.pontuacaoC,
        }
      : undefined,
    scoreColaborador: colaborador.scores
      ? {
          scoreGeral: colaborador.scores.scoreGeral,
          scoreFitCultural: colaborador.scores.scoreFitCultural,
          scoreDISC: colaborador.scores.scoreDISC,
          scoreSentimento: colaborador.scores.scoreSentimento,
          scoreConversas: colaborador.scores.scoreConversas,
          scoreAvaliacoes: colaborador.scores.scoreAvaliacoes,
          scoreMetricas: colaborador.scores.scoreMetricas,
          scoreIniciativas: colaborador.scores.scoreIniciativas,
        }
      : undefined,
    fitCultural,
    avaliacoes: avaliacoes.length > 0
      ? avaliacoes.map((a) => ({
          criterios: typeof a.criterios === 'string' ? a.criterios : JSON.stringify(a.criterios),
          comentarioGeral: a.comentarioGeral,
        }))
      : undefined,
    conversas: conversas.length > 0
      ? conversas.map((c) => ({
          tipo: c.tipo,
          resumo: c.resumo,
          pontosPositivos: c.pontosPositivos,
          pontosMelhoria: c.pontosMelhoria,
        }))
      : undefined,
    metricas: metricas.length > 0
      ? metricas.map((m) => ({
          notaFinal: m.scorecard?.notaFinal ?? 0,
        }))
      : undefined,
  }

  // 5. Monta e chama IA
  const userMessage = montarPromptAnalisePerfilIndividual(dadosPrompt)

  const response = await callAI({
    messages: [
      { role: 'system', content: ANALISAR_PERFIL_COMPORTAMENTAL_SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    maxTokens: 2048,
    jsonMode: true,
    model: 'meta/llama-3.1-70b-instruct',
  })

  // 6. Log da chamada
  try {
    await prisma.impacto.create({
      data: {
        casoUso: 'analisar_perfil_comportamental',
        provider: 'nvidia',
        model: response.model,
        tokensIn: response.usage.promptTokens,
        tokensOut: response.usage.completionTokens,
        latencyMs: response.latencyMs,
        resposta: response.content.slice(0, 2000),
      },
    })
  } catch {
    // log não crítico
  }

  // 7. Parse da resposta
  try {
    const parsed = JSON.parse(response.content) as AnalisePerfilIndividual

    // 8. Salva o resultado no banco (campo perfilComportamental)
    await prisma.colaborador.update({
      where: { id: colaboradorId },
      data: {
        perfilComportamental: JSON.stringify(parsed),
      },
    })

    return parsed
  } catch {
    // Fallback determinístico
    return gerarFallbackIndividual(colaborador.nome, colaborador.resultadoDISC)
  }
}

// ─── Função: calcular aderência líder-equipe ─────────────

export async function calcularAderenciaLiderEquipe(
  liderId: string,
  membrosIds: string[]
): Promise<AderenciaLiderEquipe> {
  // 1. Busca líder e membros
  const [lider, membros] = await Promise.all([
    prisma.colaborador.findUnique({ where: { id: liderId } }),
    prisma.colaborador.findMany({
      where: { id: { in: membrosIds } },
    }),
  ])

  if (!lider) throw new Error(`Líder ${liderId} não encontrado`)
  if (membros.length === 0) throw new Error('Nenhum membro de equipe fornecido')

  // 2. Se líder ainda não tem perfil, analisa primeiro
  let liderPerfil = lider.perfilComportamental
  if (!liderPerfil) {
    const analise = await analisarPerfilIndividual(liderId)
    liderPerfil = JSON.stringify(analise)
  }

  // 3. Garante que todos os membros tenham perfil
  const membrosComPerfil = await Promise.all(
    membros.map(async (m) => {
      if (!m.perfilComportamental) {
        await analisarPerfilIndividual(m.id)
        const atualizado = await prisma.colaborador.findUnique({ where: { id: m.id } })
        return {
          nome: m.nome,
          funcao: m.funcao,
          perfilComportamental: atualizado?.perfilComportamental ?? 'Perfil não disponível',
        }
      }
      return {
        nome: m.nome,
        funcao: m.funcao,
        perfilComportamental: m.perfilComportamental,
      }
    })
  )

  // 4. Monta prompt de aderência
  const userMessage = montarPromptAderenciaLiderEquipe({
    lider: {
      nome: lider.nome,
      funcao: lider.funcao,
      perfilComportamental: liderPerfil,
    },
    membros: membrosComPerfil,
  })

  const response = await callAI({
    messages: [
      { role: 'system', content: ANALISAR_PERFIL_COMPORTAMENTAL_SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.2,
    maxTokens: 2048,
    jsonMode: true,
    model: 'meta/llama-3.1-70b-instruct',
  })

  try {
    const parsed = JSON.parse(response.content) as AderenciaLiderEquipe
    return parsed
  } catch {
    // Fallback
    return {
      lider: { nome: lider.nome, perfil: liderPerfil ?? 'Não disponível' },
      time: membrosComPerfil.map((m) => ({
        nome: m.nome,
        perfil: m.perfilComportamental,
        aderencia: 50,
        justificativa: 'Análise não pôde ser concluída pela IA. Score neutro atribuído.',
      })),
      aderenciaGeral: 50,
      analise: 'Análise automática não concluída. Recomenda-se revisão manual.',
      riscos: ['Análise de IA não processada completamente'],
      oportunidades: ['Revisar manualmente os perfis'],
      recomendacao: 'Avaliar manualmente antes de decidir a promoção.',
    }
  }
}

// ─── Função: sugerir melhor candidato ────────────────────

export async function sugerirMelhorCandidato(
  cargoAlvo: string,
  candidatosIds: string[],
  equipeIds: string[]
): Promise<MelhorCandidato> {
  if (candidatosIds.length < 2) {
    throw new Error('É necessário pelo menos 2 candidatos para comparação')
  }

  // 1. Busca dados
  const [candidatos, membrosEquipe] = await Promise.all([
    prisma.colaborador.findMany({ where: { id: { in: candidatosIds } } }),
    prisma.colaborador.findMany({ where: { id: { in: equipeIds } } }),
  ])

  // 2. Garante que todos tenham perfil comportamental
  const candidatosComPerfil = await Promise.all(
    candidatos.map(async (c) => {
      if (!c.perfilComportamental) {
        await analisarPerfilIndividual(c.id)
        const atualizado = await prisma.colaborador.findUnique({ where: { id: c.id } })
        return {
          nome: c.nome,
          funcao: c.funcao,
          perfilComportamental: atualizado?.perfilComportamental ?? 'Perfil não disponível',
        }
      }
      return {
        nome: c.nome,
        funcao: c.funcao,
        perfilComportamental: c.perfilComportamental,
      }
    })
  )

  const equipeComPerfil = await Promise.all(
    membrosEquipe.map(async (m) => {
      if (!m.perfilComportamental) {
        await analisarPerfilIndividual(m.id)
        const atualizado = await prisma.colaborador.findUnique({ where: { id: m.id } })
        return {
          nome: m.nome,
          funcao: m.funcao,
          perfilComportamental: atualizado?.perfilComportamental ?? 'Perfil não disponível',
        }
      }
      return {
        nome: m.nome,
        funcao: m.funcao,
        perfilComportamental: m.perfilComportamental,
      }
    })
  )

  // 3. Monta prompt
  const userMessage = montarPromptMelhorCandidato({
    cargoAlvo,
    candidatos: candidatosComPerfil,
    membrosEquipe: equipeComPerfil,
  })

  const response = await callAI({
    messages: [
      { role: 'system', content: ANALISAR_PERFIL_COMPORTAMENTAL_SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.2,
    maxTokens: 2048,
    jsonMode: true,
    model: 'meta/llama-3.1-70b-instruct',
  })

  try {
    const parsed = JSON.parse(response.content) as MelhorCandidato
    return parsed
  } catch {
    // Fallback
    return {
      candidatos: candidatosComPerfil.map((c, i) => ({
        nome: c.nome,
        perfilResumo: c.perfilComportamental,
        aderenciaEquipe: 50,
        scoreCompatibilidade: 50,
        pontosFortes: ['Análise não processada'],
        pontosRisco: ['Revisão manual necessária'],
      })),
      melhorOpcao: candidatosComPerfil[0]?.nome ?? 'Indefinido',
      justificativa: 'Análise automática falhou. Recomenda-se revisão manual.',
      scoreComparativo: { melhor: 50, segundo: 50 },
    }
  }
}

// ─── Actions para uso em server actions ──────────────────

export async function analisarPerfilIndividualAction(
  colaboradorId: string
): Promise<{ sucesso: boolean; dados?: AnalisePerfilIndividual; erro?: string }> {
  try {
    const resultado = await analisarPerfilIndividual(colaboradorId)
    return { sucesso: true, dados: resultado }
  } catch (err) {
    return { sucesso: false, erro: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

export async function calcularAderenciaLiderEquipeAction(
  liderId: string,
  membrosIds: string[]
): Promise<{ sucesso: boolean; dados?: AderenciaLiderEquipe; erro?: string }> {
  try {
    const resultado = await calcularAderenciaLiderEquipe(liderId, membrosIds)
    return { sucesso: true, dados: resultado }
  } catch (err) {
    return { sucesso: false, erro: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

export async function sugerirMelhorCandidatoAction(
  cargoAlvo: string,
  candidatosIds: string[],
  equipeIds: string[]
): Promise<{ sucesso: boolean; dados?: MelhorCandidato; erro?: string }> {
  try {
    const resultado = await sugerirMelhorCandidato(cargoAlvo, candidatosIds, equipeIds)
    return { sucesso: true, dados: resultado }
  } catch (err) {
    return { sucesso: false, erro: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

// ─── Fallback determinístico ────────────────────────────

function gerarFallbackIndividual(
  nome: string,
  resultadoDISC?: { perfil: string; pontuacaoD: number; pontuacaoI: number; pontuacaoS: number; pontuacaoC: number } | null
): AnalisePerfilIndividual {
  const perfil = resultadoDISC?.perfil ?? 'N/D'

  const mapearNivel = (valor: number): 'baixo' | 'medio' | 'alto' => {
    if (valor >= 7) return 'alto'
    if (valor >= 4) return 'medio'
    return 'baixo'
  }

  return {
    perfilResumo: `Perfil DISC: ${perfil}. Análise baseada apenas no resultado DISC (IA não processou dados completos).`,
    dimensoes: {
      dominancia: {
        nivel: mapearNivel(resultadoDISC?.pontuacaoD ?? 0),
        descricao: resultadoDISC
          ? `Pontuação D: ${resultadoDISC.pontuacaoD}/10`
          : 'Não avaliado',
      },
      influencia: {
        nivel: mapearNivel(resultadoDISC?.pontuacaoI ?? 0),
        descricao: resultadoDISC
          ? `Pontuação I: ${resultadoDISC.pontuacaoI}/10`
          : 'Não avaliado',
      },
      estabilidade: {
        nivel: mapearNivel(resultadoDISC?.pontuacaoS ?? 0),
        descricao: resultadoDISC
          ? `Pontuação S: ${resultadoDISC.pontuacaoS}/10`
          : 'Não avaliado',
      },
      conformidade: {
        nivel: mapearNivel(resultadoDISC?.pontuacaoC ?? 0),
        descricao: resultadoDISC
          ? `Pontuação C: ${resultadoDISC.pontuacaoC}/10`
          : 'Não avaliado',
      },
    },
    forcas: ['Análise completa não processada pela IA'],
    pontosAtencao: ['Recomenda-se execução completa da análise'],
    estiloLideranca: `Estilo baseado em DISC ${perfil} — validar com análise completa`,
    recomendacaoAmbiente: 'Ambiente a definir — análise complementar necessária',
  }
}
