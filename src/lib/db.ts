import { prisma } from './prisma'
import type { SessionPayload } from './auth'
import bcrypt from 'bcryptjs'
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
  Plano,
  Assinatura,
  Pagamento,
  GastoSistema,
  Investimento,
  Empresa,
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
    cpf: p.cpf ?? undefined,
    liderImediatoId: p.liderImediatoId,
    createdAt: p.createdAt.toISOString(),
    status: p.status as 'ativo' | 'vago',
    fotoUrl: p.fotoUrl ?? undefined,
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

export async function listarColaboradores(options?: { incluirAdmins?: boolean }): Promise<Colaborador[]> {
  const data = await prisma.colaborador.findMany({ orderBy: { nome: 'asc' } })
  let result = data.map(colPrismaParaModelo)
  // Por padrão, exclui admins da plataforma (não pertencem a empresas)
  if (!options?.incluirAdmins) {
    result = result.filter(
      (c) => c.papel !== Papel.ADMIN_PLATAFORMA && c.papel !== Papel.ADMIN_SUPORTE
    )
  }
  return result
}

export async function buscarColaborador(id: string): Promise<Colaborador | undefined> {
  const data = await prisma.colaborador.findUnique({ where: { id } })
  return data ? colPrismaParaModelo(data) : undefined
}

/** Gera email no formato cpf@empresa_slug.com */
async function gerarEmailPorCPF(cpf: string, empresaId: string): Promise<string> {
  const empresa = await prisma.empresa.findUnique({ where: { id: empresaId }, select: { slug: true } })
  const slug = empresa?.slug ?? 'empresa'
  const cpfLimpo = cpf.replace(/\D/g, '')
  return `${cpfLimpo}@${slug}.com`
}

const SENHA_PADRAO = (cpf: string) => {
  const apenasNumeros = cpf.replace(/\D/g, '')
  return apenasNumeros.slice(0, 6)
}

export async function criarColaborador(
  dados: Omit<Colaborador, 'id' | 'createdAt'>
): Promise<Colaborador> {
  const papel = dados.papel ?? Papel.OPERACIONAL
  let email = dados.email ?? null
  let senhaHash: string | null = null

  // Se tem CPF, gera email automático e senha padrão
  if (dados.cpf) {
    email = await gerarEmailPorCPF(dados.cpf, dados.empresaId)
    senhaHash = await bcrypt.hash(SENHA_PADRAO(dados.cpf), 10)
  }

  const data = await prisma.colaborador.create({
    data: {
      empresaId: dados.empresaId,
      nome: dados.nome,
      funcao: dados.funcao,
      papel,
      email,
      cpf: dados.cpf ?? null,
      senhaHash,
      liderImediatoId: dados.liderImediatoId,
      status: dados.status || 'ativo',
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
    // Proteção: nunca permitir excluir o último ADMIN_PLATAFORMA ou ADMIN_SUPORTE
    const alvo = await prisma.colaborador.findUnique({ where: { id }, select: { papel: true } })
    if (alvo && (alvo.papel === 'ADMIN_PLATAFORMA' || alvo.papel === 'ADMIN_SUPORTE')) {
      const total = await prisma.colaborador.count({ where: { papel: alvo.papel } })
      if (total <= 1) {
        throw new Error(`Não é possível excluir o último ${alvo.papel === 'ADMIN_PLATAFORMA' ? 'Administrador da Plataforma' : 'Administrador de Suporte'}. Crie outro admin antes ou use o script scripts/criar-admin.ts.`)
      }
    }

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

// ─── Cargos Default ────────────────────────────────────────────
// Cargos que toda empresa já possui por padrão, baseados nos papéis do sistema
const CARGOS_DEFAULT = [
  'CEO',
  'DIRETOR',
  'GERENTE',
  'SUPERVISOR',
  'GESTOR',
  'LIDER',
  'OPERACIONAL',
]

// ─── Cargos ─────────────────────────────────────────────────

export async function listarCargos(): Promise<Cargo[]> {
  // 1. Busca cargos registrados na tabela Cargo (empresa pode ter adicionado)
  const cargosTabela = await prisma.cargo.findMany({
    select: { nome: true },
  })

  // 2. Busca funções em uso por colaboradores ativos (para incluir cargos
  //    que foram atribuídos diretamente sem passar pela tabela Cargo)
  const colaboradores = await prisma.colaborador.findMany({
    where: { status: 'ativo' },
    select: { funcao: true, papel: true },
  })
  const funcoesEmUso = [
    ...new Set(
      colaboradores
        .filter(
          (c) =>
            c.funcao &&
            c.papel !== 'ADMIN_PLATAFORMA' &&
            c.papel !== 'ADMIN_SUPORTE'
        )
        .map((c) => c.funcao)
        .filter(Boolean)
    ),
  ]

  // 3. Mescla tudo: defaults + tabela + funções em uso, sem duplicatas
  const todosNomes = [
    ...new Set([
      ...CARGOS_DEFAULT,
      ...cargosTabela.map((c) => c.nome),
      ...funcoesEmUso,
    ]),
  ].sort()

  return todosNomes.map((nome, i) => ({ id: `cargo_${i}`, nome }))
}

export async function criarCargo(nome: string, empresaId: string): Promise<Cargo | null> {
  // Verifica se a empresa existe antes de criar o cargo
  const empresa = await prisma.empresa.findUnique({ where: { id: empresaId }, select: { id: true } })
  if (!empresa) return null

  return prisma.cargo.upsert({
    where: { empresaId_nome: { empresaId, nome } },
    update: {},
    create: { nome, empresaId },
  })
}

/** Garante que um cargo existe na lista. Retorna o nome ou null se a empresa não existir. */
export async function garantirCargo(nome: string, empresaId?: string): Promise<string | null> {
  if (!empresaId) return null
  const cargo = await criarCargo(nome, empresaId)
  return cargo?.nome ?? null
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

// ─── Planos ────────────────────────────────────────────────────

export async function listarPlanos(): Promise<Plano[]> {
  const data = await prisma.plano.findMany({
    where: { ativo: true },
    orderBy: { precoMensal: 'asc' },
  })
  return data.map((p: any) => ({
    id: p.id,
    nome: p.nome,
    slug: p.slug,
    descricao: p.descricao,
    precoMensal: p.precoMensal,
    precoAnual: p.precoAnual,
    maxColaboradores: p.maxColaboradores,
    recursos: JSON.parse(p.recursos),
    destaque: p.destaque,
    ativo: p.ativo,
  }))
}

export async function buscarPlanoPorSlug(slug: string): Promise<Plano | null> {
  const data = await prisma.plano.findUnique({
    where: { slug, ativo: true },
  })
  if (!data) return null
  return {
    id: data.id,
    nome: data.nome,
    slug: data.slug,
    descricao: data.descricao,
    precoMensal: data.precoMensal,
    precoAnual: data.precoAnual,
    maxColaboradores: data.maxColaboradores,
    recursos: JSON.parse(data.recursos),
    destaque: data.destaque,
    ativo: data.ativo,
  }
}

// ─── Empresa + CEO (Onboarding) ──────────────────────────────

export async function criarEmpresaComCEO(dados: {
  nome: string
  slug: string
  cnpj: string
  contatoNome: string
  contatoEmail: string
  ceoNome: string
  ceoEmail: string
  ceoSenha: string
  planoId: string
  ciclo: string
}): Promise<void> {
  const senhaHash = await bcrypt.hash(dados.ceoSenha, 10)

  // Busca o plano para obter o preço
  const plano = await prisma.plano.findUnique({ where: { id: dados.planoId } })
  if (!plano) throw new Error('Plano não encontrado')

  const valor = dados.ciclo === 'anual' ? plano.precoAnual : plano.precoMensal

  const empresa = await prisma.empresa.create({
    data: {
      nome: dados.nome,
      slug: dados.slug,
      cnpj: dados.cnpj,
      contatoNome: dados.contatoNome,
      contatoEmail: dados.contatoEmail,
      dataContratacao: new Date(),
      colaboradores: {
        create: {
          nome: dados.ceoNome,
          email: dados.ceoEmail,
          senhaHash,
          funcao: 'CEO',
          papel: Papel.CEO,
          status: 'ativo',
        },
      },
      cargos: {
        create: CARGOS_DEFAULT.map((nome) => ({ nome })),
      },
      assinatura: {
        create: {
          planoId: dados.planoId,
          status: 'ativa',
          ciclo: dados.ciclo,
          dataInicio: new Date(),
          pagamentos: {
            create: {
              valor,
              metodo: 'cartao_credito',
              status: 'aprovado',
              referenciaExterna: `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            },
          },
        },
      },
    },
    include: { assinatura: true },
  })

  // Atualiza dataProximoPagamento da assinatura
  const diasCiclo = dados.ciclo === 'anual' ? 365 : 30
  await prisma.assinatura.update({
    where: { id: empresa.assinatura!.id },
    data: { dataProximoPagamento: new Date(Date.now() + diasCiclo * 24 * 60 * 60 * 1000) },
  })
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

// ═══════════════════════════════════════════════════════════
// ─── SaaS / Admin ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

export async function buscarPlano(slug: string): Promise<Plano | null> {
  const data = await prisma.plano.findUnique({ where: { slug } })
  if (!data) return null
  return { ...data, recursos: JSON.parse(data.recursos as string) }
}

export async function buscarPlanoPorId(id: string): Promise<Plano | null> {
  const data = await prisma.plano.findUnique({ where: { id } })
  if (!data) return null
  return { ...data, recursos: JSON.parse(data.recursos as string) }
}

// ─── Assinaturas ──────────────────────────────────────────
export async function criarAssinatura(dados: { empresaId: string; planoId: string; ciclo: string }): Promise<Assinatura> {
  const data = await prisma.assinatura.create({
    data: {
      empresaId: dados.empresaId,
      planoId: dados.planoId,
      ciclo: dados.ciclo,
      status: 'ativa',
      dataInicio: new Date(),
      dataProximoPagamento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    include: { plano: true },
  })
  return { ...data, dataInicio: data.dataInicio.toISOString(), dataProximoPagamento: data.dataProximoPagamento?.toISOString() ?? null, dataCancelamento: data.dataCancelamento?.toISOString() ?? null, plano: { ...data.plano, recursos: JSON.parse(data.plano.recursos as string) } }
}

export async function buscarAssinatura(empresaId: string): Promise<Assinatura | null> {
  const data = await prisma.assinatura.findUnique({
    where: { empresaId },
    include: { plano: true },
  })
  if (!data) return null
  return { ...data, dataInicio: data.dataInicio.toISOString(), dataProximoPagamento: data.dataProximoPagamento?.toISOString() ?? null, dataCancelamento: data.dataCancelamento?.toISOString() ?? null, plano: { ...data.plano, recursos: JSON.parse(data.plano.recursos as string) } }
}

// ─── Pagamentos (Mock) ────────────────────────────────────
export async function registrarPagamentoMock(dados: { assinaturaId: string; valor: number; metodo: string }): Promise<Pagamento> {
  const data = await prisma.pagamento.create({
    data: {
      assinaturaId: dados.assinaturaId,
      valor: dados.valor,
      metodo: dados.metodo,
      status: 'aprovado',
      referenciaExterna: `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    },
  })
  return { ...data, createdAt: data.createdAt.toISOString() }
}

export async function listarPagamentos(assinaturaId: string): Promise<Pagamento[]> {
  const data = await prisma.pagamento.findMany({
    where: { assinaturaId },
    orderBy: { createdAt: 'desc' },
  })
  return data.map(p => ({ ...p, createdAt: p.createdAt.toISOString() }))
}

// ─── Gastos do Sistema ────────────────────────────────────
export async function listarGastosSistema(mes?: number, ano?: number): Promise<GastoSistema[]> {
  const where: any = {}
  if (mes !== undefined) where.mes = mes
  if (ano !== undefined) where.ano = ano
  const data = await prisma.gastoSistema.findMany({ where, orderBy: [{ ano: 'desc' }, { mes: 'desc' }] })
  return data.map(g => ({ ...g, tipo: g.tipo as GastoSistema['tipo'], createdAt: g.createdAt.toISOString() }))
}

export async function criarGastoSistema(dados: Omit<GastoSistema, 'id' | 'createdAt'>): Promise<GastoSistema> {
  const data = await prisma.gastoSistema.create({ data: dados as any })
  return { ...data, tipo: data.tipo as GastoSistema['tipo'], createdAt: data.createdAt.toISOString() }
}

export async function atualizarGastoSistema(id: string, dados: Partial<Omit<GastoSistema, 'id' | 'createdAt'>>): Promise<GastoSistema | null> {
  try {
    const data = await prisma.gastoSistema.update({ where: { id }, data: dados as any })
    return { ...data, tipo: data.tipo as GastoSistema['tipo'], createdAt: data.createdAt.toISOString() }
  } catch { return null }
}

export async function removerGastoSistema(id: string): Promise<boolean> {
  try { await prisma.gastoSistema.delete({ where: { id } }); return true }
  catch { return false }
}

export async function obterTotalGastos(mes?: number, ano?: number): Promise<number> {
  const where: any = {}
  if (mes !== undefined) where.mes = mes
  if (ano !== undefined) where.ano = ano
  const result = await prisma.gastoSistema.aggregate({ where, _sum: { valor: true } })
  return result._sum.valor ?? 0
}

export async function obterGastosPorTipo(mes: number, ano: number): Promise<{ tipo: string; valor: number }[]> {
  const gastos = await prisma.gastoSistema.findMany({ where: { mes, ano } })
  const agrupado: Record<string, number> = {}
  for (const g of gastos) {
    agrupado[g.tipo] = (agrupado[g.tipo] ?? 0) + g.valor
  }
  return Object.entries(agrupado).map(([tipo, valor]) => ({ tipo, valor }))
}

// ─── Investimentos ───────────────────────────────────────
export async function listarInvestimentos(): Promise<Investimento[]> {
  const data = await prisma.investimento.findMany({ orderBy: { data: 'desc' } })
  return data.map(i => ({ ...i, data: i.data.toISOString(), createdAt: i.createdAt.toISOString() }))
}

export async function criarInvestimento(dados: Omit<Investimento, 'id' | 'createdAt'>): Promise<Investimento> {
  const data = await prisma.investimento.create({ data: { ...dados, data: new Date(dados.data) } })
  return { ...data, data: data.data.toISOString(), createdAt: data.createdAt.toISOString() }
}

export async function atualizarInvestimento(id: string, dados: Partial<Omit<Investimento, 'id' | 'createdAt'>>): Promise<Investimento | null> {
  try {
    const updateData: any = { ...dados }
    if (dados.data) updateData.data = new Date(dados.data)
    const data = await prisma.investimento.update({ where: { id }, data: updateData })
    return { ...data, data: data.data.toISOString(), createdAt: data.createdAt.toISOString() }
  } catch { return null }
}

export async function removerInvestimento(id: string): Promise<boolean> {
  try { await prisma.investimento.delete({ where: { id } }); return true }
  catch { return false }
}

export async function obterTotalInvestimentos(): Promise<number> {
  const result = await prisma.investimento.aggregate({ _sum: { valor: true } })
  return result._sum.valor ?? 0
}

// ─── Admin: Empresas ──────────────────────────────────────
export async function listarEmpresasAdmin(): Promise<(Empresa & { totalColaboradores: number; assinatura?: Assinatura | null })[]> {
  const data = await prisma.empresa.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { colaboradores: true } },
      assinatura: { include: { plano: true } },
    },
  })
  return data.map(e => ({
    id: e.id, nome: e.nome, slug: e.slug, cnpj: e.cnpj,
    contatoNome: e.contatoNome, contatoEmail: e.contatoEmail, contatoTelefone: e.contatoTelefone,
    dataContratacao: e.dataContratacao.toISOString(), createdAt: e.createdAt.toISOString(), ativa: e.ativa,
    totalColaboradores: e._count.colaboradores,
    assinatura: e.assinatura ? {
      ...e.assinatura,
      dataInicio: e.assinatura.dataInicio.toISOString(),
      dataProximoPagamento: e.assinatura.dataProximoPagamento?.toISOString() ?? null,
      dataCancelamento: e.assinatura.dataCancelamento?.toISOString() ?? null,
      plano: { ...e.assinatura.plano, recursos: JSON.parse(e.assinatura.plano.recursos as string) },
    } : null,
  }))
}

export async function buscarEmpresaAdmin(id: string): Promise<(Empresa & { totalColaboradores: number; assinatura?: Assinatura | null }) | null> {
  const data = await prisma.empresa.findUnique({
    where: { id },
    include: {
      _count: { select: { colaboradores: true } },
      assinatura: { include: { plano: true } },
    },
  })
  if (!data) return null
  return {
    id: data.id, nome: data.nome, slug: data.slug, cnpj: data.cnpj,
    contatoNome: data.contatoNome, contatoEmail: data.contatoEmail, contatoTelefone: data.contatoTelefone,
    dataContratacao: data.dataContratacao.toISOString(), createdAt: data.createdAt.toISOString(), ativa: data.ativa,
    totalColaboradores: data._count.colaboradores,
    assinatura: data.assinatura ? {
      ...data.assinatura,
      dataInicio: data.assinatura.dataInicio.toISOString(),
      dataProximoPagamento: data.assinatura.dataProximoPagamento?.toISOString() ?? null,
      dataCancelamento: data.assinatura.dataCancelamento?.toISOString() ?? null,
      plano: { ...data.assinatura.plano, recursos: JSON.parse(data.assinatura.plano.recursos as string) },
    } : null,
  }
}

export async function alternarStatusEmpresa(id: string, ativa: boolean): Promise<boolean> {
  try {
    await prisma.empresa.update({ where: { id }, data: { ativa } })
    return true
  } catch { return false }
}

export async function deletarEmpresaAdmin(id: string): Promise<boolean> {
  try {
    // Remove dados relacionados
    const colaboradores = await prisma.colaborador.findMany({ where: { empresaId: id }, select: { id: true } })
    const ids = colaboradores.map(c => c.id)
    
    await prisma.avaliacao.deleteMany({ where: { OR: [{ avaliadorId: { in: ids } }, { avaliadoId: { in: ids } }] } })
    await prisma.metricaMensal.deleteMany({ where: { colaboradorId: { in: ids } } })
    await prisma.iniciativa.deleteMany({ where: { colaboradorId: { in: ids } } })
    await prisma.fitCulturalResposta.deleteMany({ where: { colaboradorId: { in: ids } } })
    await prisma.respostaDISC.deleteMany({ where: { colaboradorId: { in: ids } } })
    await prisma.resultadoDISC.deleteMany({ where: { colaboradorId: { in: ids } } })
    await prisma.pesquisaSentimento.deleteMany({ where: { colaboradorId: { in: ids } } })
    await prisma.conversa.deleteMany({ where: { OR: [{ colaboradorId: { in: ids } }, { criadoPorId: { in: ids } }] } })
    await prisma.scoreColaborador.deleteMany({ where: { colaboradorId: { in: ids } } })
    await prisma.pagamento.deleteMany({ where: { assinatura: { empresaId: id } } })
    await prisma.assinatura.deleteMany({ where: { empresaId: id } })
    await prisma.colaborador.deleteMany({ where: { empresaId: id } })
    await prisma.regraImpacto.deleteMany({ where: { empresaId: id } })
    await prisma.cargo.deleteMany({ where: { empresaId: id } })
    await prisma.fitCulturalPergunta.deleteMany({ where: { empresaId: id } })
    await prisma.perguntaDISC.deleteMany({ where: { empresaId: id } })
    await prisma.empresa.delete({ where: { id } })
    return true
  } catch { return false }
}

export async function obterReceitaTotal(ano?: number): Promise<number> {
  const where: any = { status: 'aprovado' }
  if (ano !== undefined) {
    const data = await prisma.pagamento.findMany({ where: { status: 'aprovado' } })
    return data.filter(p => new Date(p.createdAt).getFullYear() === ano).reduce((s, p) => s + p.valor, 0)
  }
  const result = await prisma.pagamento.aggregate({ where, _sum: { valor: true } })
  return result._sum.valor ?? 0
}

export async function obterReceitaMensal(mes: number, ano: number): Promise<number> {
  const pagamentos = await prisma.pagamento.findMany({ where: { status: 'aprovado' } })
  return pagamentos
    .filter(p => {
      const d = new Date(p.createdAt)
      return d.getMonth() + 1 === mes && d.getFullYear() === ano
    })
    .reduce((s, p) => s + p.valor, 0)
}

export async function obterReceitaDiaria(dia: Date): Promise<number> {
  const inicio = new Date(dia)
  inicio.setHours(0, 0, 0, 0)
  const fim = new Date(dia)
  fim.setHours(23, 59, 59, 999)
  const pagamentos = await prisma.pagamento.findMany({
    where: {
      status: 'aprovado',
      createdAt: { gte: inicio, lte: fim },
    },
  })
  return pagamentos.reduce((s, p) => s + p.valor, 0)
}

export async function contarEmpresasAtivas(): Promise<number> {
  return prisma.empresa.count({ where: { ativa: true } })
}

export async function contarEmpresasInativas(): Promise<number> {
  return prisma.empresa.count({ where: { ativa: false } })
}

export async function obterTotalColaboradoresSistema(): Promise<number> {
  return prisma.colaborador.count({ where: { empresaId: { not: null } } })
}

export async function obterAdminPorEmail(email: string): Promise<SessionPayload | null> {
  const data = await prisma.colaborador.findFirst({
    where: { email, papel: 'ADMIN_PLATAFORMA' },
  })
  if (!data || !data.senhaHash) return null
  return {
    colaboradorId: data.id,
    empresaId: data.empresaId ?? '',
    empresaNome: 'Sistema',
    nome: data.nome,
    email: data.email!,
    papel: Papel.ADMIN_PLATAFORMA,
  }
}

export async function criarAdminSistema(dados: {
  nome: string
  email: string
  senha: string
  papel?: 'ADMIN_PLATAFORMA' | 'ADMIN_SUPORTE'
}): Promise<boolean> {
  const senhaHash = await bcrypt.hash(dados.senha, 10)
  
  const papelAlvo = dados.papel ?? 'ADMIN_PLATAFORMA'
  const existente = await prisma.colaborador.findFirst({
    where: { email: dados.email, papel: papelAlvo },
  })
  if (existente) return false

  await prisma.colaborador.create({
    data: {
      empresaId: null,
      nome: dados.nome,
      funcao: papelAlvo === 'ADMIN_SUPORTE' ? 'Suporte da Plataforma' : 'Administrador do Sistema',
      email: dados.email,
      senhaHash,
      papel: papelAlvo,
      status: 'ativo',
      username: dados.nome,
    },
  })
  return true
}

// ─── Perfil do Admin ─────────────────────────────────────
export async function atualizarPerfilAdmin(
  id: string,
  dados: { nome?: string; username?: string; fotoUrl?: string | null; tema?: string }
): Promise<boolean> {
  try {
    const updateData: any = {}
    if (dados.nome !== undefined) updateData.nome = dados.nome
    if (dados.username !== undefined) updateData.username = dados.username
    if (dados.fotoUrl !== undefined) updateData.fotoUrl = dados.fotoUrl
    if (dados.tema !== undefined) updateData.tema = dados.tema
    await prisma.colaborador.update({ where: { id }, data: updateData })
    return true
  } catch { return false }
}

export async function alterarSenhaAdmin(
  id: string,
  senhaAtual: string,
  novaSenha: string
): Promise<{ ok: boolean; erro?: string }> {
  const admin = await prisma.colaborador.findUnique({ where: { id } })
  if (!admin || !admin.senhaHash) return { ok: false, erro: 'Usuário não encontrado' }
  
  const valida = await bcrypt.compare(senhaAtual, admin.senhaHash)
  if (!valida) return { ok: false, erro: 'Senha atual incorreta' }

  const senhaHash = await bcrypt.hash(novaSenha, 10)
  await prisma.colaborador.update({ where: { id }, data: { senhaHash } })
  return { ok: true }
}

// ─── Admin: Gerenciar Admins ──────────────────────────────
export async function listarAdmins(): Promise<{
  id: string; nome: string; email: string | null; username: string | null;
  fotoUrl: string | null; status: string; createdAt: string; papel: string
}[]> {
  const data = await prisma.colaborador.findMany({
    where: {
      OR: [
        { papel: 'ADMIN_PLATAFORMA' },
        { papel: 'ADMIN_SUPORTE' },
      ],
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, nome: true, email: true, username: true, fotoUrl: true, status: true, createdAt: true, papel: true },
  })
  return data.map(a => ({ ...a, email: a.email ?? '', createdAt: a.createdAt.toISOString() }))
}

export async function deletarAdmin(id: string): Promise<boolean> {
  try {
    await prisma.colaborador.delete({ where: { id } })
    return true
  } catch { return false }
}

// ─── Admin: Criar Empresa com CEO ────────────────────────
export async function criarEmpresaPeloAdmin(dados: {
  empresaNome: string
  empresaSlug: string
  ceoNome: string
  ceoEmail: string
  ceoSenha: string
}): Promise<{ ok: boolean; erro?: string }> {
  // Verifica se slug já existe
  const slugExiste = await prisma.empresa.findUnique({ where: { slug: dados.empresaSlug } })
  if (slugExiste) return { ok: false, erro: 'Slug já está em uso' }

  // Verifica se email do CEO já está em uso
  const emailExiste = await prisma.colaborador.findFirst({
    where: { email: dados.ceoEmail, empresaId: { not: null } },
  })
  if (emailExiste) return { ok: false, erro: 'Email do CEO já está cadastrado em outra empresa' }

  const senhaHash = await bcrypt.hash(dados.ceoSenha, 10)

  // Cria empresa + CEO + cargos default + assinatura grátis
  const empresa = await prisma.empresa.create({
    data: {
      nome: dados.empresaNome,
      slug: dados.empresaSlug,
      contatoNome: dados.ceoNome,
      contatoEmail: dados.ceoEmail,
      colaboradores: {
        create: {
          nome: dados.ceoNome,
          funcao: 'CEO',
          email: dados.ceoEmail,
          senhaHash,
          papel: 'CEO',
          username: dados.ceoNome,
          status: 'ativo',
        },
      },
      cargos: {
        create: CARGOS_DEFAULT.map((nome) => ({ nome })),
      },
      assinatura: {
        create: {
          planoId: (await prisma.plano.findFirst({ where: { slug: 'gratuito' } }))?.id ?? '',
          status: 'ativa',
          dataInicio: new Date(),
          ciclo: 'mensal',
        },
      },
    },
    include: { assinatura: true },
  })

  if (!empresa.assinatura) {
    // Se não achou plano gratuito, tenta o primeiro plano disponível
    const primeiroPlano = await prisma.plano.findFirst()
    if (primeiroPlano) {
      await prisma.assinatura.create({
        data: {
          empresaId: empresa.id,
          planoId: primeiroPlano.id,
          status: 'ativa',
          ciclo: 'mensal',
        },
      })
    }
  }

  return { ok: true }
}
