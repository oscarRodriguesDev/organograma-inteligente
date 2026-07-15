import { prisma } from './prisma'
import type {
  Colaborador,
  Avaliacao,
  Iniciativa,
  MetricaMensal,
  RegraImpacto,
  Impacto,
  Cargo,
} from './types'

// ─── Helpers de conversão ────────────────────────────────────

function colPrismaParaModelo(p: any): Colaborador {
  return {
    id: p.id,
    nome: p.nome,
    funcao: p.funcao,
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
      nome: dados.nome,
      funcao: dados.funcao,
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

export async function listarRegrasImpacto(): Promise<RegraImpacto[]> {
  const data = await prisma.regraImpacto.findMany()
  return data.map(regraPrismaParaModelo)
}

export async function criarRegraImpacto(
  dados: Omit<RegraImpacto, 'id'>
): Promise<RegraImpacto> {
  const data = await prisma.regraImpacto.create({
    data: {
      nome: dados.nome,
      descricao: dados.descricao,
      tipo: dados.tipo,
      condicao: JSON.stringify(dados.condicao),
      ativa: dados.ativa,
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
  await prisma.impacto.deleteMany()
  if (impactos.length === 0) return
  await prisma.impacto.createMany({
    data: impactos.map((i) => ({
      id: i.id,
      tipo: i.tipo,
      titulo: i.titulo,
      descricao: i.descricao,
      colaboradorId: i.colaboradorId ?? null,
      colaboradorNome: i.colaboradorNome ?? null,
      regraId: i.regraId ?? null,
    })),
  })
}

export async function carregarImpactosSimulacao(): Promise<Impacto[]> {
  const data = await prisma.impacto.findMany()
  return data.map((i) => ({
    id: i.id,
    tipo: i.tipo as 'positivo' | 'negativo' | 'neutro',
    titulo: i.titulo,
    descricao: i.descricao,
    colaboradorId: i.colaboradorId ?? undefined,
    colaboradorNome: i.colaboradorNome ?? undefined,
    regraId: i.regraId ?? undefined,
  }))
}

export async function limparImpactosSimulacao(): Promise<void> {
  await prisma.impacto.deleteMany()
}

// ─── Cargos ─────────────────────────────────────────────────

export async function listarCargos(): Promise<Cargo[]> {
  return prisma.cargo.findMany({ orderBy: { nome: 'asc' } })
}

export async function criarCargo(nome: string): Promise<Cargo> {
  return prisma.cargo.upsert({
    where: { nome },
    update: {},
    create: { nome },
  })
}

/** Garante que um cargo existe na lista. Retorna o nome. */
export async function garantirCargo(nome: string): Promise<string> {
  await criarCargo(nome)
  return nome
}
