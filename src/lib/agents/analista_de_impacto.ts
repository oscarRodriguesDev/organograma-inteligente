/**
 * Analista de Impacto — Agente de IA para avaliar impactos de demissão ou promoção.
 *
 * Este agente coleta dados de múltiplas fontes (avaliações, conversas, advertências,
 * suspensões, iniciativas, métricas, projetos, testes, organograma) e utiliza a
 * NVIDIA API para gerar uma análise qualitativa completa sobre os possíveis impactos
 * de uma demissão ou promoção de um colaborador.
 *
 * Uso:
 *   import { analisarImpacto } from '@/lib/agents/analista_de_impacto'
 *   const resultado = await analisarImpacto('colaborador-id', 'demissao')
 */

import { prisma } from '@/lib/prisma'
import { callAI } from '@/lib/ai/client'
import { ANALISAR_IMPACTO_SYSTEM_PROMPT, montarPromptAnaliseImpacto } from './prompts/analisar-impacto'
import {
  listarAvaliacoesPorAvaliado,
  listarConversas,
  listarAdvertenciasPorColaborador,
  listarSuspensoesPorColaborador,
  listarIniciativasDoColaborador,
  listarMetricasPorColaborador,
  listarProjetosDoColaborador,
  listarColaboradores,
} from '@/lib/db'

// ─── Tipos ───────────────────────────────────────────────

export type TipoAcao = 'demissao' | 'promocao'

export interface AnaliseImpacto {
  resumo: string
  scoreFavoravel: number
  nivelRisco: 'baixo' | 'medio' | 'alto'
  analiseDetalhada: {
    avaliacoes: { resumo: string; indicios: string; peso: 'positivo' | 'negativo' | 'neutro' }
    conversas: { resumo: string; aberturaFeedback: string; peso: 'positivo' | 'negativo' | 'neutro' }
    advertenciasSuspensoes: { resumo: string; justaCausa: boolean; totalAdvertencias: number; totalSuspensoes: number; peso: 'positivo' | 'negativo' | 'neutro' }
    iniciativas: { resumo: string; nivelParticipacao: 'baixo' | 'medio' | 'alto'; peso: 'positivo' | 'negativo' | 'neutro' }
    metricas: { resumo: string; tendencia: 'crescente' | 'estavel' | 'decrescente'; mediaNota: number; peso: 'positivo' | 'negativo' | 'neutro' }
    projetos: { resumo: string; impactoProjetos: string; peso: 'positivo' | 'negativo' | 'neutro' }
    testes: { resumo: string; aderenciaPerfil: string; peso: 'positivo' | 'negativo' | 'neutro' }
    organograma: { resumo: string; impactoTime: string; peso: 'positivo' | 'negativo' | 'neutro' }
  }
  recomendacao: string
  riscos: string[]
  oportunidades: string[]
  acoesSugeridas: string[]
}

// ─── Função principal ────────────────────────────────────

export async function analisarImpacto(
  colaboradorId: string,
  tipoAcao: TipoAcao
): Promise<AnaliseImpacto> {
  // 1. Busca dados do colaborador
  const colaborador = await prisma.colaborador.findUnique({
    where: { id: colaboradorId },
    include: {
      empresa: { select: { nome: true } },
      lider: { select: { id: true, nome: true, funcao: true } },
      resultadoDISC: true,
      scores: true,
    },
  })

  if (!colaborador) {
    throw new Error(`Colaborador ${colaboradorId} não encontrado`)
  }

  // 2. Coleta dados de todas as fontes em paralelo
  const [
    avaliacoes,
    conversas,
    advertencias,
    suspensoes,
    iniciativas,
    metricas,
    projetos,
    todosColaboradores,
  ] = await Promise.all([
    listarAvaliacoesPorAvaliado(colaboradorId),
    listarConversas(colaboradorId),
    listarAdvertenciasPorColaborador(colaboradorId),
    listarSuspensoesPorColaborador(colaboradorId),
    listarIniciativasDoColaborador(colaboradorId),
    listarMetricasPorColaborador(colaboradorId),
    listarProjetosDoColaborador(colaboradorId),
    listarColaboradores({ incluirAdmins: false }),
  ])

  // 3. Busca testes psicológicos do colaborador
  const testesAtribuidos = await prisma.testeAtribuido.findMany({
    where: { colaboradorId },
    include: {
      teste: { select: { titulo: true, tipo: true } },
    },
  })

  // Busca respostas dos testes
  const respostasTestes = await prisma.respostaTesteColaborador.findMany({
    where: { colaboradorId },
    include: {
      pergunta: { select: { pergunta: true } },
    },
  })

  // 4. Monta estrutura do time (organograma)
  const estruturaTime = todosColaboradores
    .filter((c) => c.liderImediatoId === colaboradorId || c.id === colaborador.liderImediatoId || c.id === colaboradorId)
    .map((c) => ({
      nome: c.nome,
      funcao: c.funcao,
      papel: c.papel,
      ehSubordinado: c.liderImediatoId === colaboradorId,
      ehLider: c.id === colaborador.liderImediatoId,
    }))

  // 5. Prepara dados para o prompt
  const dadosPrompt = {
    tipoAcao,
    colaborador: {
      id: colaborador.id,
      nome: colaborador.nome,
      funcao: colaborador.funcao,
      papel: colaborador.papel as string,
      tempoNaEmpresa: colaborador.createdAt
        ? `${Math.floor((Date.now() - new Date(colaborador.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30))} meses`
        : undefined,
    },
    avaliacoes: avaliacoes.map((a) => ({
      data: a.data,
      criterios: typeof a.criterios === 'string' ? a.criterios : JSON.stringify(a.criterios),
      comentarioGeral: a.comentarioGeral,
      avaliadorNome: undefined as string | undefined,
    })),
    conversas: conversas.map((c) => ({
      tipo: c.tipo,
      titulo: c.titulo,
      assunto: c.assunto,
      resumo: c.resumo,
      pontosPositivos: c.pontosPositivos,
      pontosMelhoria: c.pontosMelhoria,
      realizadaEm: c.realizadaEm,
    })),
    advertencias: advertencias.map((a) => ({
      titulo: a.titulo,
      descricao: a.descricao,
      tipo: a.tipo,
      data: a.data,
    })),
    suspensoes: suspensoes.map((s) => ({
      motivo: s.motivo,
      dataInicio: s.dataInicio,
      dataFim: s.dataFim ?? null,
      observacao: s.observacao,
    })),
    metricas: metricas.map((m) => ({
      periodo: `${m.mes}/${m.ano}`,
      diasTrabalhados: m.diasTrabalhados,
      faltasInjustificadas: m.faltasInjustificadas,
      horasAtraso: m.horasAtraso,
      notaFinal: m.scorecard?.notaFinal ?? 0,
    })),
    iniciativas: iniciativas.map((i) => ({
      titulo: i.titulo,
      descricao: i.descricao,
      resultado: i.resultado,
      status: i.status,
    })),
    projetos: projetos.map((p) => ({
      nome: p.nome,
      descricao: p.descricao,
      status: p.status,
      dataInicio: p.dataInicio,
      dataFim: p.dataFim,
    })),
    testesPsicologicos: testesAtribuidos.map((t) => ({
      titulo: t.teste.titulo,
      tipo: t.teste.tipo,
      respostas: respostasTestes
        .filter((r) => r.testeId === t.testeId)
        .map((r) => `Pergunta: ${r.pergunta.pergunta} | Resposta: ${r.resposta}`)
        .join('; '),
    })),
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
    estruturaTime,
  }

  // 6. Monta o prompt completo
  const userMessage = montarPromptAnaliseImpacto(dadosPrompt)

  // 7. Chama a NVIDIA API
  const response = await callAI({
    messages: [
      { role: 'system', content: ANALISAR_IMPACTO_SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.2,
    maxTokens: 2048,
    jsonMode: true,
    model: 'meta/llama-3.1-70b-instruct', // modelo mais profundo para análise complexa
  })

  // 8. Log da chamada no banco
  try {
    await prisma.impacto.create({
      data: {
        casoUso: 'analisar_impacto',
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

  // 9. Parse da resposta
  try {
    const parsed = JSON.parse(response.content) as AnaliseImpacto
    return parsed
  } catch {
    // Se falhar o parse, retorna fallback
    return gerarFallback(colaborador.nome, tipoAcao, {
      totalAdvertencias: advertencias.length,
      totalSuspensoes: suspensoes.length,
      mediaMetricas: metricas.length > 0
        ? metricas.reduce((s, m) => s + (m.scorecard?.notaFinal ?? 0), 0) / metricas.length
        : 0,
      totalIniciativas: iniciativas.length,
      totalProjetosEmAndamento: projetos.filter((p) => p.status === 'em_andamento').length,
    })
  }
}

// ─── Fallback determinístico ────────────────────────────

interface DadosFallback {
  totalAdvertencias: number
  totalSuspensoes: number
  mediaMetricas: number
  totalIniciativas: number
  totalProjetosEmAndamento: number
}

function gerarFallback(
  nome: string,
  tipoAcao: TipoAcao,
  dados: DadosFallback
): AnaliseImpacto {
  const temProblemasGraves = dados.totalAdvertencias > 2 || dados.totalSuspensoes > 0
  const metricasBoas = dados.mediaMetricas >= 7
  const pontuacaoBase = metricasBoas ? 6 : 4
  const ajusteAdvertencias = Math.max(0, dados.totalAdvertencias * 1.5)
  const ajusteIniciativas = Math.min(2, dados.totalIniciativas * 0.5)

  const score = tipoAcao === 'demissao'
    ? Math.max(0, Math.min(10, pontuacaoBase - ajusteAdvertencias + ajusteIniciativas))
    : Math.max(0, Math.min(10, pontuacaoBase - ajusteAdvertencias + ajusteIniciativas + (metricasBoas ? 2 : 0)))

  return {
    resumo: `Análise baseada em dados determinísticos para ${nome}. ${temProblemasGraves ? 'Colaborador apresenta registros disciplinares que precisam ser considerados.' : 'Sem registros disciplinares graves.'}`,
    scoreFavoravel: Math.round(score * 10) / 10,
    nivelRisco: score >= 7 ? 'baixo' : score >= 4 ? 'medio' : 'alto',
    analiseDetalhada: {
      avaliacoes: { resumo: 'Dados não processados pela IA. Verifique manualmente.', indicios: 'Não avaliado', peso: 'neutro' },
      conversas: { resumo: 'Dados não processados pela IA.', aberturaFeedback: 'Não avaliado', peso: 'neutro' },
      advertenciasSuspensoes: {
        resumo: `${dados.totalAdvertencias} advertência(s) e ${dados.totalSuspensoes} suspensão(ões) encontrada(s).`,
        justaCausa: dados.totalSuspensoes > 0,
        totalAdvertencias: dados.totalAdvertencias,
        totalSuspensoes: dados.totalSuspensoes,
        peso: dados.totalAdvertencias > 0 || dados.totalSuspensoes > 0 ? 'negativo' : 'positivo',
      },
      iniciativas: {
        resumo: `${dados.totalIniciativas} iniciativa(s) registrada(s).`,
        nivelParticipacao: dados.totalIniciativas > 3 ? 'alto' : dados.totalIniciativas > 0 ? 'medio' : 'baixo',
        peso: dados.totalIniciativas > 0 ? 'positivo' : 'neutro',
      },
      metricas: {
        resumo: `Média das métricas: ${dados.mediaMetricas.toFixed(1)}/10.`,
        tendencia: dados.mediaMetricas >= 7 ? 'crescente' : dados.mediaMetricas >= 5 ? 'estavel' : 'decrescente',
        mediaNota: Math.round(dados.mediaMetricas * 10) / 10,
        peso: dados.mediaMetricas >= 7 ? 'positivo' : dados.mediaMetricas >= 5 ? 'neutro' : 'negativo',
      },
      projetos: {
        resumo: `${dados.totalProjetosEmAndamento} projeto(s) em andamento.`,
        impactoProjetos: `${tipoAcao === 'demissao' ? 'Demissão pode impactar' : 'Promoção pode afetar'} ${dados.totalProjetosEmAndamento} projeto(s) em andamento.`,
        peso: dados.totalProjetosEmAndamento > 0 && tipoAcao === 'demissao' ? 'negativo' : 'neutro',
      },
      testes: { resumo: 'Análise de perfil não realizada pela IA.', aderenciaPerfil: 'Não avaliado', peso: 'neutro' },
      organograma: { resumo: 'Análise de organograma não realizada pela IA.', impactoTime: 'Não avaliado', peso: 'neutro' },
    },
    recomendacao: `Recomenda-se análise manual detalhada. Score automático: ${score.toFixed(1)}/10. ${temProblemasGraves ? 'Atenção aos registros disciplinares.' : ''}`,
    riscos: temProblemasGraves ? ['Registros disciplinares encontrados'] : [],
    oportunidades: metricasBoas ? ['Métricas de desempenho positivas'] : [],
    acoesSugeridas: ['Realizar análise complementar manual', 'Agendar conversa com o colaborador'],
  }
}

// ─── Função auxiliar para uso em server actions ─────────

export async function analisarImpactoAction(
  colaboradorId: string,
  tipoAcao: TipoAcao
): Promise<{ sucesso: boolean; dados?: AnaliseImpacto; erro?: string }> {
  try {
    const resultado = await analisarImpacto(colaboradorId, tipoAcao)
    return { sucesso: true, dados: resultado }
  } catch (err) {
    return { sucesso: false, erro: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}
