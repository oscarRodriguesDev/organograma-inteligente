'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { listarMetricasPorColaborador, listarConversas, atualizarStatusIniciativa, listarAdvertenciasPorColaborador, listarSuspensoesPorColaborador, listarIniciativasDoColaborador, listarProjetosDoColaborador } from '@/lib/db'
import type { MetricaMensal, Conversa, Iniciativa, Advertencia, Suspensao, Projeto } from '@/lib/types'

async function verificarSessao() {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')
  return session
}

export interface DadosDesempenho {
  colaborador: {
    id: string
    nome: string
    email: string | null
    funcao: string
    papel: string
    fotoUrl: string | null
    username: string | null
    liderNome: string | null
    createdAt: string
  }
  metricas: MetricaMensal[]
  iniciativas: (Iniciativa & { colaboradorNome?: string })[]
  conversas: (Conversa & { colaboradorNome?: string })[]
  advertencias: (Advertencia & { aplicadaPorNome?: string })[]
  suspensoes: (Suspensao & { aplicadaPorNome?: string })[]
  projetos: Projeto[]
}

export async function obterDadosDesempenho(colaboradorId: string): Promise<DadosDesempenho> {
  const session = await verificarSessao()

  // Só permite ver o próprio desempenho ou se for gestor/lider/CEO do colaborador
  const isProprio = session.colaboradorId === colaboradorId
  const isGestor = ['CEO', 'DIRETOR', 'GERENTE', 'SUPERVISOR', 'GESTOR', 'RH', 'ADMIN_PLATAFORMA', 'ADMIN_SUPORTE'].includes(session.papel)

  if (!isProprio && !isGestor) {
    throw new Error('Sem permissão para visualizar este desempenho')
  }

  // Se não é o próprio usuário, busca dados do colaborador e verifica liderança
  let colaboradorData: {
    id: string
    nome: string
    email: string | null
    funcao: string
    papel: string
    fotoUrl: string | null
    username: string | null
    liderNome: string | null
    createdAt: string
  }

  if (isProprio) {
    // Usa dados do token JWT (sem query ao banco)
    colaboradorData = {
      id: session.colaboradorId,
      nome: session.nome,
      email: session.email,
      funcao: session.funcao,
      papel: session.papel,
      fotoUrl: session.fotoUrl ?? null,
      username: session.username ?? null,
      liderNome: null, // Session não tem liderNome; busca se necessário
      createdAt: '', // Session não tem createdAt; query separada abaixo
    }
    // Só busca liderNome se o session tiver o campo (não tem por padrão)
    // Para o próprio usuário, liderNome é opcional; buscamos apenas 1 campo leve
    if (isProprio) {
      const liderData = await prisma.colaborador.findUnique({
        where: { id: session.colaboradorId },
        select: {
          liderImediatoId: true,
          createdAt: true,
        },
      })
      if (liderData?.liderImediatoId) {
        const lider = await prisma.colaborador.findUnique({
          where: { id: liderData.liderImediatoId },
          select: { nome: true },
        })
        colaboradorData.liderNome = lider?.nome ?? null
      }
      colaboradorData.createdAt = liderData?.createdAt.toISOString() ?? ''
    }
  } else {
    // Busca dados completos do colaborador (não é o próprio)
    const colaborador = await prisma.colaborador.findUnique({
      where: { id: colaboradorId },
      select: {
        id: true,
        nome: true,
        email: true,
        funcao: true,
        papel: true,
        fotoUrl: true,
        username: true,
        liderImediatoId: true,
        createdAt: true,
      },
    })
    if (!colaborador) throw new Error('Colaborador não encontrado')

    // Verifica liderança
    if (session.papel !== 'ADMIN_PLATAFORMA' && session.papel !== 'ADMIN_SUPORTE') {
      const isLider = await verificarLideranca(session.colaboradorId, colaboradorId)
      if (!isLider) {
        throw new Error('Você não tem permissão para ver o desempenho deste colaborador')
      }
    }

    let liderNome: string | null = null
    if (colaborador.liderImediatoId) {
      const lider = await prisma.colaborador.findUnique({
        where: { id: colaborador.liderImediatoId },
        select: { nome: true },
      })
      liderNome = lider?.nome ?? null
    }

    colaboradorData = {
      id: colaborador.id,
      nome: colaborador.nome,
      email: colaborador.email,
      funcao: colaborador.funcao,
      papel: colaborador.papel,
      fotoUrl: colaborador.fotoUrl,
      username: colaborador.username,
      liderNome,
      createdAt: colaborador.createdAt.toISOString(),
    }
  }

  const [metricas, iniciativas, conversas, advertencias, suspensoes, projetos] = await Promise.all([
    listarMetricasPorColaborador(colaboradorId),
    listarIniciativasDoColaborador(colaboradorId),
    listarConversas(colaboradorId),
    listarAdvertenciasPorColaborador(colaboradorId),
    listarSuspensoesPorColaborador(colaboradorId),
    listarProjetosDoColaborador(colaboradorId),
  ])

  return {
    colaborador: colaboradorData,
    metricas,
    iniciativas,
    conversas,
    advertencias,
    suspensoes,
    projetos,
  }
}

async function verificarLideranca(liderId: string, subordinadoId: string): Promise<boolean> {
  // Sobe a hierarquia do subordinado até encontrar o líder
  let currentId: string | null = subordinadoId
  let depth = 0
  const maxDepth = 10 // segurança contra loops

  while (currentId && depth < maxDepth) {
    if (currentId === liderId) return true
    const liderData: { liderImediatoId: string | null } | null = await (prisma.colaborador as any).findUnique({
      where: { id: currentId },
      select: { liderImediatoId: true },
    })
    currentId = liderData?.liderImediatoId ?? null
    depth++
  }

  return false
}

export async function aprovarIniciativaAction(iniciativaId: string, status: 'aprovada' | 'recusada') {
  const session = await verificarSessao()

  // Verifica se a iniciativa pertence a um subordinado do gestor
  const iniciativa = await prisma.iniciativa.findUnique({
    where: { id: iniciativaId },
    select: { colaboradorId: true, titulo: true },
  })
  if (!iniciativa) throw new Error('Iniciativa não encontrada')

  // Só gestores/lideres/CEO podem aprovar
  const isGestor = ['CEO', 'DIRETOR', 'GERENTE', 'SUPERVISOR', 'GESTOR', 'RH', 'ADMIN_PLATAFORMA', 'ADMIN_SUPORTE'].includes(session.papel)

  if (!isGestor) {
    throw new Error('Apenas gestores podem aprovar iniciativas')
  }

  const isLider = await verificarLideranca(session.colaboradorId, iniciativa.colaboradorId)
  if (!isLider && session.papel !== 'ADMIN_PLATAFORMA' && session.papel !== 'ADMIN_SUPORTE') {
    throw new Error('Você só pode aprovar iniciativas dos seus subordinados')
  }

  const ok = await atualizarStatusIniciativa(iniciativaId, status)
  revalidatePath(`/meu-desempenho`)
  return ok
}

export async function criarIniciativaAction(formData: FormData): Promise<{ ok: boolean; erro?: string }> {
  const session = await verificarSessao()

  const titulo = formData.get('titulo')?.toString().trim()
  const descricao = formData.get('descricao')?.toString().trim() ?? ''
  const resultado = formData.get('resultado')?.toString().trim() ?? ''
  const valorResultadoStr = formData.get('valorResultado')?.toString().trim()
  const unidadeMedida = formData.get('unidadeMedida')?.toString().trim() ?? ''

  if (!titulo) {
    return { ok: false, erro: 'O título é obrigatório' }
  }

  if (titulo.length > 200) {
    return { ok: false, erro: 'O título deve ter no máximo 200 caracteres' }
  }

  const valorResultado = valorResultadoStr ? parseFloat(valorResultadoStr) : 0
  if (Number.isNaN(valorResultado) || valorResultado < 0) {
    return { ok: false, erro: 'Valor do resultado inválido' }
  }

  try {
    await prisma.iniciativa.create({
      data: {
        colaboradorId: session.colaboradorId,
        titulo,
        descricao,
        resultado,
        valorResultado,
        unidadeMedida,
        status: 'pendente',
      },
    })

    revalidatePath('/meu-desempenho')
    return { ok: true }
  } catch (e) {
    console.error('Erro ao criar iniciativa:', e)
    return { ok: false, erro: 'Erro ao salvar iniciativa' }
  }
}
