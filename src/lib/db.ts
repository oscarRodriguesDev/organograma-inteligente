import { prisma } from './prisma'
import type {
  Colaborador,
  Avaliacao,
  Iniciativa,
  MetricaMensal,
  RegraImpacto,
  Impacto,
  Cargo,
  FitCulturalPergunta,
  FitCulturalResposta,
  PerguntaDISC,
  RespostaDISC,
  ResultadoDISC,
  PesquisaSentimento,
  Conversa,
  ScoreColaborador,
} from './types'
import { Papel } from './types'

// ─── Helpers de conversão ────────────────────────────────────

function colPrismaParaModelo(p: any): Colaborador {
  return {
    id: p.id,
    empresaId: p.empresaId,
    nome: p.nome,
    funcao: p.funcao,
    papel: p.papel as Papel,
    email: p.email ?? undefined,
    liderImediatoId: p.liderImediatoId,
    createdAt: p.createdAt.toISOString(),
    status: p.status as 'ativo' | 'vago',
  }
}

function avPrismaParaModelo(a: any): Avaliacao {
  return {
    id: a.id,
    avaliadorId: a.avaliadorId,
    avaliadoId: a.avaliadoId,
    data: a.data.toISOString(),
    criterios: JSON.parse(a.criterios),
    comentarioGeral: a.comentarioGeral,
  }
}

function metricaPrismaParaModelo(m: any): MetricaMensal {
  return {
    id: m.id,
    colaboradorId: m.colaboradorId,
    mes: m.mes,
    ano: m.ano,
    diasTrabalhados: m.diasTrabalhados,
    faltasInjustificadas: m.faltasInjustificadas,
    horasAtraso: m.horasAtraso,
    observacao: m.observacao,
    data: m.data.toISOString(),
  }
}

function iniciativaPrismaParaModelo(i: any): Iniciativa {
  return {
    id: i.id,
    colaboradorId: i.colaboradorId,
    titulo: i.titulo,
    descricao: i.descricao,
    resultado: i.resultado,
    valorResultado: i.valorResultado,
    unidadeMedida: i.unidadeMedida,
    data: i.data.toISOString(),
  }
}

function regraPrismaParaModelo(r: any): RegraImpacto {
  return {
    id: r.id,
    nome: r.nome,
    descricao: r.descricao,
    tipo: r.tipo as 'positivo' | 'negativo' | 'neutro',
    condicao: JSON.parse(r.condicao),
    ativa: r.ativa,
  }
}

// ─── Colaboradores ───────────────────────────────────────────

export async function listarColaboradores(): Promise<Colaborador[]> {
  const data = await prisma.colaborador.findMany({ orderBy: { nome: 'asc' } })
  return data.map(colPrismaParaModelo)
}

export async function buscarColaborador(id: string): Promise<Colaborador | undefined> {
  const data = await prisma.colaborador.findUnique({ where: { id } })
  return data ? colPrismaParaModelo(data) : undefined
}

export async function criarColaborador(
  dados: Omit<Colaborador, 'id' | 'createdAt'>
): Promise<Colaborador> {
  const data = await prisma.colaborador.create({
    data: {
      empresaId: dados.empresaId,
      nome: dados.nome,
      funcao: dados.funcao,
      papel: dados.papel ?? Papel.COLABORADOR,
      email: dados.email ?? null,
      liderImediatoId: dados.liderImediatoId,
      status: (dados as any).status || 'ativo',
    },
  })
  return colPrismaParaModelo(data)
}

export async function atualizarColaborador(
  id: string,
  dados: Partial<Omit<Colaborador, 'id' | 'createdAt'>>
): Promise<Colaborador | undefined> {
  const updateData: any = {}
  if (dados.nome !== undefined) updateData.nome = dados.nome
  if (dados.funcao !== undefined) updateData.funcao = dados.funcao
  if (dados.liderImediatoId !== undefined) updateData.liderImediatoId = dados.liderImediatoId
  if (dados.status !== undefined) updateData.status = dados.status

  try {
    const data = await prisma.colaborador.update({
      where: { id },
      data: updateData,
    })
    return colPrismaParaModelo(data)
  } catch {
    return undefined
  }
}

export async function removerColaborador(id: string): Promise<boolean> {
  try {
    // Remove registros relacionados antes de excluir o colaborador
    await prisma.avaliacao.deleteMany({ where: { avaliadorId: id } })
    await prisma.avaliacao.deleteMany({ where: { avaliadoId: id } })
    await prisma.metricaMensal.deleteMany({ where: { colaboradorId: id } })
    await prisma.iniciativa.deleteMany({ where: { colaboradorId: id } })

    await prisma.colaborador.delete({ where: { id } })
    return true
  } catch {
    return false
  }
}

// ─── Avaliações ──────────────────────────────────────────────

export async function listarAvaliacoes(): Promise<Avaliacao[]> {
  const data = await prisma.avaliacao.findMany({ orderBy: { data: 'desc' } })
  return data.map(avPrismaParaModelo)
}

export async function buscarAvaliacao(id: string): Promise<Avaliacao | undefined> {
  const data = await prisma.avaliacao.findUnique({ where: { id } })
  return data ? avPrismaParaModelo(data) : undefined
}

export async function criarAvaliacao(
  dados: Omit<Avaliacao, 'id' | 'data'>
): Promise<Avaliacao> {
  const data = await prisma.avaliacao.create({
    data: {
      avaliadorId: dados.avaliadorId,
      avaliadoId: dados.avaliadoId,
      criterios: JSON.stringify(dados.criterios),
      comentarioGeral: dados.comentarioGeral,
    },
  })
  return avPrismaParaModelo(data)
}

export async function removerAvaliacao(id: string): Promise<boolean> {
  try {
    await prisma.avaliacao.delete({ where: { id } })
    return true
  } catch {
    return false
  }
}

export async function listarAvaliacoesPorAvaliador(avaliadorId: string): Promise<Avaliacao[]> {
  const data = await prisma.avaliacao.findMany({
    where: { avaliadorId },
    orderBy: { data: 'desc' },
  })
  return data.map(avPrismaParaModelo)
}

export async function listarAvaliacoesPorAvaliado(avaliadoId: string): Promise<Avaliacao[]> {
  const data = await prisma.avaliacao.findMany({
    where: { avaliadoId },
    orderBy: { data: 'desc' },
  })
  return data.map(avPrismaParaModelo)
}

// ─── Iniciativas ─────────────────────────────────────────────

export async function listarIniciativas(): Promise<Iniciativa[]> {
  const data = await prisma.iniciativa.findMany({ orderBy: { data: 'desc' } })
  return data.map(iniciativaPrismaParaModelo)
}

export async function criarIniciativa(
  dados: Omit<Iniciativa, 'id' | 'data'>
): Promise<Iniciativa> {
  const data = await prisma.iniciativa.create({
    data: {
      colaboradorId: dados.colaboradorId,
      titulo: dados.titulo,
      descricao: dados.descricao,
      resultado: dados.resultado,
      valorResultado: dados.valorResultado,
      unidadeMedida: dados.unidadeMedida,
    },
  })
  return iniciativaPrismaParaModelo(data)
}

export async function removerIniciativa(id: string): Promise<boolean> {
  try {
    await prisma.iniciativa.delete({ where: { id } })
    return true
  } catch {
    return false
  }
}

export async function listarIniciativasPorColaborador(colaboradorId: string): Promise<Iniciativa[]> {
  const data = await prisma.iniciativa.findMany({
    where: { colaboradorId },
    orderBy: { data: 'desc' },
  })
  return data.map(iniciativaPrismaParaModelo)
}

// ─── Métricas ────────────────────────────────────────────────

export async function listarMetricas(): Promise<MetricaMensal[]> {
  const data = await prisma.metricaMensal.findMany({ orderBy: [{ ano: 'desc' }, { mes: 'desc' }] })
  return data.map(metricaPrismaParaModelo)
}

export async function criarMetrica(
  dados: Omit<MetricaMensal, 'id' | 'data'>
): Promise<MetricaMensal> {
  const data = await prisma.metricaMensal.create({
    data: {
      colaboradorId: dados.colaboradorId,
      mes: dados.mes,
      ano: dados.ano,
      diasTrabalhados: dados.diasTrabalhados,
      faltasInjustificadas: dados.faltasInjustificadas,
      horasAtraso: dados.horasAtraso,
      observacao: dados.observacao,
    },
  })
  return metricaPrismaParaModelo(data)
}

export async function removerMetrica(id: string): Promise<boolean> {
  try {
    await prisma.metricaMensal.delete({ where: { id } })
    return true
  } catch {
    return false
  }
}

export async function listarMetricasPorColaborador(colaboradorId: string): Promise<MetricaMensal[]> {
  const data = await prisma.metricaMensal.findMany({
    where: { colaboradorId },
    orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
  })
  return data.map(metricaPrismaParaModelo)
}

// ─── Regras de Impacto ───────────────────────────────────────

export async function listarRegrasImpacto(empresaId?: string): Promise<RegraImpacto[]> {
  const where: any = {}
  if (empresaId) where.empresaId = empresaId
  const data = await prisma.regraImpacto.findMany({ where })
  return data.map(regraPrismaParaModelo)
}

export async function criarRegraImpacto(
  dados: Omit<RegraImpacto, 'id'>
): Promise<RegraImpacto> {
  const empresaId = 'empresa_default'
  const data = await prisma.regraImpacto.create({
    data: {
      nome: dados.nome,
      descricao: dados.descricao,
      tipo: dados.tipo,
      condicao: JSON.stringify(dados.condicao),
      ativa: dados.ativa,
      empresaId,
    },
  })
  return regraPrismaParaModelo(data)
}

export async function atualizarRegraImpacto(
  id: string,
  dados: Partial<Omit<RegraImpacto, 'id'>>
): Promise<RegraImpacto | undefined> {
  const updateData: any = {}
  if (dados.nome !== undefined) updateData.nome = dados.nome
  if (dados.descricao !== undefined) updateData.descricao = dados.descricao
  if (dados.tipo !== undefined) updateData.tipo = dados.tipo
  if (dados.condicao !== undefined) updateData.condicao = JSON.stringify(dados.condicao)
  if (dados.ativa !== undefined) updateData.ativa = dados.ativa

  try {
    const data = await prisma.regraImpacto.update({
      where: { id },
      data: updateData,
    })
    return regraPrismaParaModelo(data)
  } catch {
    return undefined
  }
}

export async function removerRegraImpacto(id: string): Promise<boolean> {
  try {
    await prisma.regraImpacto.delete({ where: { id } })
    return true
  } catch {
    return false
  }
}

// ─── Histórico de Impactos ──────────────────────────────────

export async function salvarImpactosSimulacao(impactos: Impacto[]): Promise<void> {
  // Remove registros anteriores de simulação (não afeta logs de IA)
  await prisma.impacto.deleteMany({ where: { casoUso: 'simulacao' } })
  if (impactos.length === 0) return
  await prisma.impacto.createMany({
    data: impactos.map((i) => ({
      id: i.id,
      casoUso: 'simulacao',
      resposta: JSON.stringify({
        tipo: i.tipo,
        titulo: i.titulo,
        descricao: i.descricao,
        colaboradorId: i.colaboradorId ?? null,
        colaboradorNome: i.colaboradorNome ?? null,
        regraId: i.regraId ?? null,
      }),
    })),
  })
}

export async function carregarImpactosSimulacao(): Promise<Impacto[]> {
  const data = await prisma.impacto.findMany({
    where: { casoUso: 'simulacao' },
  })
  return data.map((i) => {
    const parsed = JSON.parse(i.resposta || '{}')
    return {
      id: i.id,
      tipo: parsed.tipo as 'positivo' | 'negativo' | 'neutro',
      titulo: parsed.titulo || '',
      descricao: parsed.descricao || '',
      colaboradorId: parsed.colaboradorId ?? undefined,
      colaboradorNome: parsed.colaboradorNome ?? undefined,
      regraId: parsed.regraId ?? undefined,
    }
  })
}

export async function limparImpactosSimulacao(): Promise<void> {
  await prisma.impacto.deleteMany({ where: { casoUso: 'simulacao' } })
}

// ─── Cargos ─────────────────────────────────────────────────

export async function listarCargos(): Promise<Cargo[]> {
  // Busca APENAS cargos que estão em uso por colaboradores ativos da empresa
  const colaboradores = await prisma.colaborador.findMany({
    where: { status: 'ativo' },
    select: { funcao: true },
    distinct: ['funcao'],
  })

  const funcoes = [...new Set(colaboradores.map((c) => c.funcao).filter(Boolean))]
    .sort()

  return funcoes.map((nome, i) => ({ id: `cargo_${i}`, nome }))
}

export async function criarCargo(nome: string): Promise<Cargo> {
  // empresaId default para operações que não têm contexto de tenant
  const empresaId = 'empresa_default'
  return prisma.cargo.upsert({
    where: { empresaId_nome: { empresaId, nome } },
    update: {},
    create: { nome, empresaId },
  })
}

/** Garante que um cargo existe na lista. Retorna o nome. */
export async function garantirCargo(nome: string): Promise<string> {
  await criarCargo(nome)
  return nome
}

// ─── Fit Cultural ────────────────────────────────────────────

export async function listarPerguntasFitCultural(): Promise<FitCulturalPergunta[]> {
  const data = await prisma.fitCulturalPergunta.findMany({
    where: { ativa: true },
    orderBy: { ordem: 'asc' },
  })
  return data.map((p: any) => ({
    id: p.id,
    pergunta: p.pergunta,
    dimensao: p.dimensao as FitCulturalPergunta['dimensao'],
    peso: p.peso,
    ativa: p.ativa,
    ordem: p.ordem,
  }))
}

export async function responderFitCultural(
  colaboradorId: string,
  respostas: { perguntaId: string; nota: number }[]
): Promise<void> {
  // Remove respostas anteriores do colaborador
  await prisma.fitCulturalResposta.deleteMany({ where: { colaboradorId } })

  // Insere novas respostas
  await prisma.fitCulturalResposta.createMany({
    data: respostas.map((r) => ({
      colaboradorId,
      perguntaId: r.perguntaId,
      nota: r.nota,
    })),
  })
}

// ─── Teste DISC ──────────────────────────────────────────────

export async function listarPerguntasDISC(): Promise<PerguntaDISC[]> {
  const data = await prisma.perguntaDISC.findMany({
    where: { ativa: true },
    orderBy: { createdAt: 'asc' },
  })
  return data.map((p: any) => ({
    id: p.id,
    pergunta: p.pergunta,
    dimensao: p.dimensao as PerguntaDISC['dimensao'],
    peso: p.peso,
    ativa: p.ativa,
  }))
}

export async function responderDISC(
  colaboradorId: string,
  respostas: { perguntaId: string; nota: number }[]
): Promise<ResultadoDISC> {
  // Remove respostas anteriores
  await prisma.respostaDISC.deleteMany({ where: { colaboradorId } })

  // Insere novas respostas
  await prisma.respostaDISC.createMany({
    data: respostas.map((r) => ({
      colaboradorId,
      perguntaId: r.perguntaId,
      nota: r.nota,
    })),
  })

  // Recalcula resultado DISC
  const perguntas = await prisma.perguntaDISC.findMany()
  const agrupado: Record<string, { total: number; count: number }> = {
    D: { total: 0, count: 0 },
    I: { total: 0, count: 0 },
    S: { total: 0, count: 0 },
    C: { total: 0, count: 0 },
  }

  for (const r of respostas) {
    const pergunta = perguntas.find((p: any) => p.id === r.perguntaId)
    if (pergunta) {
      const dim = pergunta.dimensao as string
      if (agrupado[dim]) {
        agrupado[dim].total += r.nota * pergunta.peso
        agrupado[dim].count += pergunta.peso
      }
    }
  }

  const pontuacaoD = agrupado.D.count > 0 ? Math.round((agrupado.D.total / agrupado.D.count) * 20) : 0
  const pontuacaoI = agrupado.I.count > 0 ? Math.round((agrupado.I.total / agrupado.I.count) * 20) : 0
  const pontuacaoS = agrupado.S.count > 0 ? Math.round((agrupado.S.total / agrupado.S.count) * 20) : 0
  const pontuacaoC = agrupado.C.count > 0 ? Math.round((agrupado.C.total / agrupado.C.count) * 20) : 0

  // Determina perfil (maior pontuação)
  const dimensoes = [
    { dim: 'D', val: pontuacaoD },
    { dim: 'I', val: pontuacaoI },
    { dim: 'S', val: pontuacaoS },
    { dim: 'C', val: pontuacaoC },
  ]
  dimensoes.sort((a, b) => b.val - a.val)
  const maxVal = dimensoes[0].val
  const perfil = dimensoes.filter((d) => d.val >= maxVal * 0.8).map((d) => d.dim).sort().join('')

  // Upsert resultado
  const resultado = await prisma.resultadoDISC.upsert({
    where: { colaboradorId },
    update: {
      perfil,
      pontuacaoD,
      pontuacaoI,
      pontuacaoS,
      pontuacaoC,
      data: new Date(),
    },
    create: {
      colaboradorId,
      perfil,
      pontuacaoD,
      pontuacaoI,
      pontuacaoS,
      pontuacaoC,
    },
  })

  return {
    id: resultado.id,
    colaboradorId: resultado.colaboradorId,
    perfil: resultado.perfil,
    pontuacaoD: resultado.pontuacaoD,
    pontuacaoI: resultado.pontuacaoI,
    pontuacaoS: resultado.pontuacaoS,
    pontuacaoC: resultado.pontuacaoC,
    data: resultado.data.toISOString(),
  }
}

export async function obterResultadoDISC(colaboradorId: string): Promise<ResultadoDISC | null> {
  const data = await prisma.resultadoDISC.findUnique({ where: { colaboradorId } })
  if (!data) return null
  return {
    id: data.id,
    colaboradorId: data.colaboradorId,
    perfil: data.perfil,
    pontuacaoD: data.pontuacaoD,
    pontuacaoI: data.pontuacaoI,
    pontuacaoS: data.pontuacaoS,
    pontuacaoC: data.pontuacaoC,
    data: data.data.toISOString(),
  }
}

export async function listarResultadosDISC(): Promise<(ResultadoDISC & { colaboradorNome: string })[]> {
  const data = await prisma.resultadoDISC.findMany({
    include: { colaborador: { select: { nome: true } } },
    orderBy: { data: 'desc' },
  })
  return data.map((r: any) => ({
    id: r.id,
    colaboradorId: r.colaboradorId,
    perfil: r.perfil,
    pontuacaoD: r.pontuacaoD,
    pontuacaoI: r.pontuacaoI,
    pontuacaoS: r.pontuacaoS,
    pontuacaoC: r.pontuacaoC,
    data: r.data.toISOString(),
    colaboradorNome: r.colaborador.nome,
  }))
}

// ─── Pesquisa de Sentimento ──────────────────────────────────

export async function registrarPesquisaSentimento(
  dados: Omit<PesquisaSentimento, 'id' | 'respondidoEm'>
): Promise<PesquisaSentimento> {
  const data = await prisma.pesquisaSentimento.create({
    data: {
      colaboradorId: dados.colaboradorId,
      sentimento: dados.sentimento,
      nota: dados.nota,
      engajamento: dados.engajamento ?? null,
      motivacao: dados.motivacao ?? null,
      pertencimento: dados.pertencimento ?? null,
      comentario: dados.comentario || '',
    },
  })
  return {
    id: data.id,
    colaboradorId: data.colaboradorId,
    sentimento: data.sentimento as PesquisaSentimento['sentimento'],
    nota: data.nota,
    engajamento: data.engajamento ?? undefined,
    motivacao: data.motivacao ?? undefined,
    pertencimento: data.pertencimento ?? undefined,
    comentario: data.comentario,
    respondidoEm: data.respondidoEm.toISOString(),
  }
}

export async function listarPesquisasSentimento(colaboradorId?: string): Promise<(PesquisaSentimento & { colaboradorNome: string })[]> {
  const where: any = {}
  if (colaboradorId) where.colaboradorId = colaboradorId

  const data = await prisma.pesquisaSentimento.findMany({
    where,
    include: { colaborador: { select: { nome: true } } },
    orderBy: { respondidoEm: 'desc' },
  })
  return data.map((p: any) => ({
    id: p.id,
    colaboradorId: p.colaboradorId,
    sentimento: p.sentimento as PesquisaSentimento['sentimento'],
    nota: p.nota,
    engajamento: p.engajamento ?? undefined,
    motivacao: p.motivacao ?? undefined,
    pertencimento: p.pertencimento ?? undefined,
    comentario: p.comentario,
    respondidoEm: p.respondidoEm.toISOString(),
    colaboradorNome: p.colaborador.nome,
  }))
}

// ─── Registro de Conversas ────────────────────────────────────

export async function registrarConversa(
  dados: Omit<Conversa, 'id' | 'registradaEm'>
): Promise<Conversa> {
  const data = await prisma.conversa.create({
    data: {
      colaboradorId: dados.colaboradorId,
      tipo: dados.tipo,
      titulo: dados.titulo,
      assunto: dados.assunto || '',
      resumo: dados.resumo || '',
      observacoes: dados.observacoes || '',
      pontosPositivos: dados.pontosPositivos || '',
      pontosMelhoria: dados.pontosMelhoria || '',
      realizadaEm: new Date(dados.realizadaEm),
      criadoPorId: dados.criadoPorId ?? null,
    },
  })
  return {
    id: data.id,
    colaboradorId: data.colaboradorId,
    tipo: data.tipo as Conversa['tipo'],
    titulo: data.titulo,
    assunto: data.assunto,
    resumo: data.resumo,
    observacoes: data.observacoes,
    pontosPositivos: data.pontosPositivos,
    pontosMelhoria: data.pontosMelhoria,
    realizadaEm: data.realizadaEm.toISOString(),
    registradaEm: data.registradaEm.toISOString(),
    criadoPorId: data.criadoPorId ?? undefined,
  }
}

export async function listarConversas(colaboradorId?: string): Promise<(Conversa & { colaboradorNome: string })[]> {
  const where: any = {}
  if (colaboradorId) where.colaboradorId = colaboradorId

  const data = await prisma.conversa.findMany({
    where,
    include: { colaborador: { select: { nome: true } } },
    orderBy: { realizadaEm: 'desc' },
  })
  return data.map((c: any) => ({
    id: c.id,
    colaboradorId: c.colaboradorId,
    tipo: c.tipo as Conversa['tipo'],
    titulo: c.titulo,
    assunto: c.assunto,
    resumo: c.resumo,
    observacoes: c.observacoes,
    pontosPositivos: c.pontosPositivos,
    pontosMelhoria: c.pontosMelhoria,
    realizadaEm: c.realizadaEm.toISOString(),
    registradaEm: c.registradaEm.toISOString(),
    criadoPorId: c.criadoPorId ?? undefined,
    colaboradorNome: c.colaborador.nome,
  }))
}

export async function buscarConversa(id: string): Promise<(Conversa & { colaboradorNome: string }) | null> {
  const data = await prisma.conversa.findUnique({
    where: { id },
    include: { colaborador: { select: { nome: true } } },
  })
  if (!data) return null
  return {
    id: data.id,
    colaboradorId: data.colaboradorId,
    tipo: data.tipo as Conversa['tipo'],
    titulo: data.titulo,
    assunto: data.assunto,
    resumo: data.resumo,
    observacoes: data.observacoes,
    pontosPositivos: data.pontosPositivos,
    pontosMelhoria: data.pontosMelhoria,
    realizadaEm: data.realizadaEm.toISOString(),
    registradaEm: data.registradaEm.toISOString(),
    criadoPorId: data.criadoPorId ?? undefined,
    colaboradorNome: data.colaborador.nome,
  }
}

// ─── Fit Cultural (complemento) ───────────────────────────────

export async function obterRespostasFitCultural(colaboradorId: string): Promise<FitCulturalResposta[]> {
  const data = await prisma.fitCulturalResposta.findMany({
    where: { colaboradorId },
    orderBy: { respondidoEm: 'desc' },
  })
  return data.map((r: any) => ({
    id: r.id,
    colaboradorId: r.colaboradorId,
    perguntaId: r.perguntaId,
    nota: r.nota,
    respondidoEm: r.respondidoEm.toISOString(),
  }))
}

export async function calcularScoreFitCultural(colaboradorId: string): Promise<number> {
  const respostas = await prisma.fitCulturalResposta.findMany({
    where: { colaboradorId },
  })
  if (respostas.length === 0) return 0

  const media = respostas.reduce((acc, r) => acc + r.nota, 0) / respostas.length
  return parseFloat((((media - 1) / 4) * 10).toFixed(2))
}

// ─── DISC (complemento) ───────────────────────────────────────

export async function recalcularResultadoDISC(colaboradorId: string): Promise<ResultadoDISC> {
  const respostas = await prisma.respostaDISC.findMany({
    where: { colaboradorId },
    include: { pergunta: true },
  })

  const dims: Record<string, number[]> = { D: [], I: [], S: [], C: [] }
  for (const r of respostas) {
    const d = r.pergunta.dimensao
    if (dims[d]) dims[d].push(r.nota)
  }

  const calc = (notas: number[]): number => {
    if (notas.length === 0) return 0
    const avg = notas.reduce((a, b) => a + b, 0) / notas.length
    return Math.round(((avg - 1) / 4) * 10)
  }

  const pontuacaoD = calc(dims.D)
  const pontuacaoI = calc(dims.I)
  const pontuacaoS = calc(dims.S)
  const pontuacaoC = calc(dims.C)

  const items = [
    { dim: 'D', val: pontuacaoD },
    { dim: 'I', val: pontuacaoI },
    { dim: 'S', val: pontuacaoS },
    { dim: 'C', val: pontuacaoC },
  ]
  items.sort((a, b) => b.val - a.val)
  const maxVal = items[0].val
  const perfil = items.filter((d) => d.val >= maxVal * 0.8).map((d) => d.dim).sort().join('')

  const resultado = await prisma.resultadoDISC.upsert({
    where: { colaboradorId },
    update: { perfil, pontuacaoD, pontuacaoI, pontuacaoS, pontuacaoC, data: new Date() },
    create: { colaboradorId, perfil, pontuacaoD, pontuacaoI, pontuacaoS, pontuacaoC },
  })

  return {
    id: resultado.id,
    colaboradorId: resultado.colaboradorId,
    perfil: resultado.perfil,
    pontuacaoD: resultado.pontuacaoD,
    pontuacaoI: resultado.pontuacaoI,
    pontuacaoS: resultado.pontuacaoS,
    pontuacaoC: resultado.pontuacaoC,
    data: resultado.data.toISOString(),
  }
}

// ─── Pesquisa de Sentimento (complemento) ────────────────────

export async function calcularScoreSentimento(colaboradorId: string): Promise<number> {
  const pesquisas = await prisma.pesquisaSentimento.findMany({
    where: { colaboradorId },
  })
  if (pesquisas.length === 0) return 0

  const media = pesquisas.reduce((acc, p) => acc + p.nota, 0) / pesquisas.length
  return parseFloat((((media - 1) / 4) * 10).toFixed(2))
}

// ─── Conversas (complemento) ─────────────────────────────────

export async function calcularScoreConversas(colaboradorId: string): Promise<number> {
  const conversas = await prisma.conversa.findMany({
    where: { colaboradorId },
    orderBy: { realizadaEm: 'desc' },
  })
  if (conversas.length === 0) return 0

  const seisMesesAtras = new Date()
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6)
  const recentes = conversas.filter((c) => c.realizadaEm >= seisMesesAtras)

  const comPositivos = conversas.filter((c) => c.pontosPositivos.length > 0).length
  const comMelhoria = conversas.filter((c) => c.pontosMelhoria.length > 0).length

  const proporcaoRecentes = Math.min(recentes.length / 3, 1)
  const proporcaoQualidade = conversas.length > 0
    ? (comPositivos + comMelhoria) / (conversas.length * 2)
    : 0

  const score = proporcaoRecentes * 5 + proporcaoQualidade * 5
  return parseFloat(Math.min(score, 10).toFixed(2))
}

// ─── Score Consolidado ─────────────────────────────────────────

export async function calcularEAtualizarScore(colaboradorId: string): Promise<ScoreColaborador> {
  const scoreFitCultural = await calcularScoreFitCultural(colaboradorId)
  const scoreSentimento = await calcularScoreSentimento(colaboradorId)
  const scoreConversas = await calcularScoreConversas(colaboradorId)

  const disc = await prisma.resultadoDISC.findUnique({ where: { colaboradorId } })
  const scoreDISC = disc
    ? parseFloat((((disc.pontuacaoD + disc.pontuacaoI + disc.pontuacaoS + disc.pontuacaoC) / 4)).toFixed(2))
    : 0

  const avaliacoes = await prisma.avaliacao.findMany({
    where: { avaliadoId: colaboradorId },
  })
  const scoreAvaliacoes = avaliacoes.length > 0
    ? parseFloat(
        (avaliacoes.reduce((acc, a) => {
          const criterios: Array<{ criterio: string; nota: number }> = JSON.parse(a.criterios)
          const media = criterios.reduce((s, c) => s + c.nota, 0) / criterios.length
          return acc + media
        }, 0) / avaliacoes.length * 2).toFixed(2)
      )
    : 0

  const metricas = await prisma.metricaMensal.findMany({
    where: { colaboradorId },
  })
  const scoreMetricas = metricas.length > 0
    ? parseFloat(
        (metricas.reduce((acc, m) => {
          const presenca = Math.min(m.diasTrabalhados / 22, 1)
          const frequencia = Math.max(0, 1 - (m.faltasInjustificadas * 0.15 + m.horasAtraso * 0.05))
          return acc + ((presenca * 0.6 + frequencia * 0.4) * 10)
        }, 0) / metricas.length).toFixed(2)
      )
    : 0

  const countIniciativas = await prisma.iniciativa.count({ where: { colaboradorId } })
  const scoreIniciativas = parseFloat(Math.min(countIniciativas * 2, 10).toFixed(2))

  const scoreGeral = parseFloat((
    (scoreAvaliacoes * 3 + scoreMetricas * 2 + scoreFitCultural * 2 + scoreDISC * 1 + scoreSentimento * 2 + scoreConversas * 1 + scoreIniciativas * 1) /
    (3 + 2 + 2 + 1 + 2 + 1 + 1)
  ).toFixed(2))

  const data = await prisma.scoreColaborador.upsert({
    where: { colaboradorId },
    create: {
      colaboradorId,
      scoreGeral,
      scoreFitCultural,
      scoreDISC,
      scoreSentimento,
      scoreConversas,
      scoreAvaliacoes,
      scoreMetricas,
      scoreIniciativas,
    },
    update: {
      scoreGeral,
      scoreFitCultural,
      scoreDISC,
      scoreSentimento,
      scoreConversas,
      scoreAvaliacoes,
      scoreMetricas,
      scoreIniciativas,
    },
  })

  return {
    id: data.id,
    colaboradorId: data.colaboradorId,
    scoreGeral: data.scoreGeral,
    scoreFitCultural: data.scoreFitCultural,
    scoreDISC: data.scoreDISC,
    scoreSentimento: data.scoreSentimento,
    scoreConversas: data.scoreConversas,
    scoreAvaliacoes: data.scoreAvaliacoes,
    scoreMetricas: data.scoreMetricas,
    scoreIniciativas: data.scoreIniciativas,
    ultimaAtualizacao: data.ultimaAtualizacao.toISOString(),
  }
}

export async function obterScore(colaboradorId: string): Promise<ScoreColaborador | null> {
  const data = await prisma.scoreColaborador.findUnique({ where: { colaboradorId } })
  if (!data) return null
  return {
    id: data.id,
    colaboradorId: data.colaboradorId,
    scoreGeral: data.scoreGeral,
    scoreFitCultural: data.scoreFitCultural,
    scoreDISC: data.scoreDISC,
    scoreSentimento: data.scoreSentimento,
    scoreConversas: data.scoreConversas,
    scoreAvaliacoes: data.scoreAvaliacoes,
    scoreMetricas: data.scoreMetricas,
    scoreIniciativas: data.scoreIniciativas,
    ultimaAtualizacao: data.ultimaAtualizacao.toISOString(),
  }
}

export async function listarScores(ordenarPor?: string): Promise<ScoreColaborador[]> {
  const camposValidos = [
    'scoreGeral', 'scoreFitCultural', 'scoreDISC', 'scoreSentimento',
    'scoreConversas', 'scoreAvaliacoes', 'scoreMetricas', 'scoreIniciativas', 'ultimaAtualizacao',
  ]
  const orderBy: any = {}
  if (ordenarPor && camposValidos.includes(ordenarPor)) {
    orderBy[ordenarPor] = 'desc'
  } else {
    orderBy.scoreGeral = 'desc'
  }

  const data = await prisma.scoreColaborador.findMany({ orderBy })
  return data.map((s: any) => ({
    id: s.id,
    colaboradorId: s.colaboradorId,
    scoreGeral: s.scoreGeral,
    scoreFitCultural: s.scoreFitCultural,
    scoreDISC: s.scoreDISC,
    scoreSentimento: s.scoreSentimento,
    scoreConversas: s.scoreConversas,
    scoreAvaliacoes: s.scoreAvaliacoes,
    scoreMetricas: s.scoreMetricas,
    scoreIniciativas: s.scoreIniciativas,
    ultimaAtualizacao: s.ultimaAtualizacao.toISOString(),
  }))
}
