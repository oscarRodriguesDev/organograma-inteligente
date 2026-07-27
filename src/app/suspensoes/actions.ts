'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { criarSuspensao } from '@/lib/db'
import type { Suspensao } from '@/lib/types'

function isGestor(papel: string): boolean {
  return ['CEO', 'DIRETOR', 'GERENTE', 'SUPERVISOR', 'GESTOR', 'LIDER', 'RH', 'ADMIN_PLATAFORMA', 'ADMIN_SUPORTE'].includes(papel)
}

export async function listarSuspensoesAction(colaboradorId?: string): Promise<(Suspensao & { colaboradorNome?: string; aplicadaPorNome?: string })[]> {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')

  const where: any = {}

  if (colaboradorId) {
    where.colaboradorId = colaboradorId
  } else if (isGestor(session.papel)) {
    // Lista suspensões dos subordinados diretos
    const subordinados = await prisma.colaborador.findMany({
      where: { liderImediatoId: session.colaboradorId },
      select: { id: true },
    })
    const ids = subordinados.map((s) => s.id)
    if (ids.length > 0) {
      where.colaboradorId = { in: ids }
    } else {
      return []
    }
  } else {
    // Operacional só vê as próprias
    where.colaboradorId = session.colaboradorId
  }

  const data = await prisma.suspensao.findMany({
    where,
    orderBy: { dataInicio: 'desc' },
    include: {
      colaborador: { select: { nome: true } },
      aplicadaPor: { select: { nome: true } },
    },
  })

  return data.map((s) => ({
    id: s.id,
    colaboradorId: s.colaboradorId,
    motivo: s.motivo,
    dataInicio: s.dataInicio.toISOString(),
    dataFim: s.dataFim?.toISOString() ?? null,
    aplicadaPorId: s.aplicadaPorId,
    colaboradorNome: s.colaborador.nome,
    aplicadaPorNome: s.aplicadaPor.nome,
    observacao: s.observacao,
  }))
}

export async function criarSuspensaoAction(formData: FormData): Promise<void> {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')

  if (!isGestor(session.papel)) {
    throw new Error('Apenas gestores podem aplicar suspensões')
  }

  const colaboradorId = formData.get('colaboradorId')?.toString()
  const motivo = formData.get('motivo')?.toString().trim()
  const dataInicio = formData.get('dataInicio')?.toString()
  const dataFim = formData.get('dataFim')?.toString()
  const observacao = formData.get('observacao')?.toString().trim() ?? ''

  if (!colaboradorId) throw new Error('Selecione o colaborador')
  if (!motivo) throw new Error('O motivo é obrigatório')
  if (!dataInicio) throw new Error('A data de início é obrigatória')

  if (motivo.length > 500) {
    throw new Error('O motivo deve ter no máximo 500 caracteres')
  }
  if (observacao.length > 2000) {
    throw new Error('A observação deve ter no máximo 2000 caracteres')
  }

  const dataInicioDate = new Date(dataInicio)
  if (isNaN(dataInicioDate.getTime())) {
    throw new Error('Data de início inválida')
  }

  let dataFimDate: Date | undefined
  if (dataFim) {
    dataFimDate = new Date(dataFim)
    if (isNaN(dataFimDate.getTime())) {
      throw new Error('Data de fim inválida')
    }
    if (dataFimDate <= dataInicioDate) {
      throw new Error('A data de fim deve ser posterior à data de início')
    }
  }

  // Verifica se o colaborador alvo é subordinado direto
  const alvo = await prisma.colaborador.findUnique({
    where: { id: colaboradorId },
    select: { liderImediatoId: true },
  })

  if (!alvo) throw new Error('Colaborador não encontrado')

  // Admins podem suspender qualquer um; gestores apenas subordinados diretos
  const isAdmin = session.papel === 'ADMIN_PLATAFORMA' || session.papel === 'ADMIN_SUPORTE'
  if (!isAdmin && alvo.liderImediatoId !== session.colaboradorId) {
    throw new Error('Você só pode suspender seus subordinados diretos')
  }

  await criarSuspensao({
    colaboradorId,
    motivo,
    dataInicio: dataInicioDate,
    dataFim: dataFimDate,
    aplicadaPorId: session.colaboradorId,
    observacao,
  })

  revalidatePath('/suspensoes')
  redirect('/suspensoes')
}

export async function listarSubordinadosAction(): Promise<{ id: string; nome: string; funcao: string }[]> {
  const session = await getSession()
  if (!session) return []

  if (!isGestor(session.papel)) return []

  const data = await prisma.colaborador.findMany({
    where: { liderImediatoId: session.colaboradorId, status: 'ativo' },
    select: { id: true, nome: true, funcao: true },
    orderBy: { nome: 'asc' },
  })

  return data.map((c) => ({
    id: c.id,
    nome: c.nome,
    funcao: c.funcao,
  }))
}
