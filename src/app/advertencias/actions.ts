'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { criarAdvertencia } from '@/lib/db'
import type { Advertencia } from '@/lib/types'

function isGestor(papel: string): boolean {
  return ['CEO', 'DIRETOR', 'GERENTE', 'SUPERVISOR', 'GESTOR', 'LIDER', 'RH', 'ADMIN_PLATAFORMA', 'ADMIN_SUPORTE'].includes(papel)
}

export async function listarAdvertenciasAction(colaboradorId?: string): Promise<(Advertencia & { colaboradorNome?: string; aplicadaPorNome?: string })[]> {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')

  const where: any = {}

  if (colaboradorId) {
    where.colaboradorId = colaboradorId
  } else if (isGestor(session.papel)) {
    // Lista advertências dos subordinados diretos
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

  const data = await prisma.advertencia.findMany({
    where,
    orderBy: { data: 'desc' },
    include: {
      colaborador: { select: { nome: true } },
      aplicadaPor: { select: { nome: true } },
    },
  })

  return data.map((a) => ({
    id: a.id,
    colaboradorId: a.colaboradorId,
    titulo: a.titulo,
    descricao: a.descricao,
    tipo: a.tipo as Advertencia['tipo'],
    aplicadaPorId: a.aplicadaPorId,
    colaboradorNome: a.colaborador.nome,
    aplicadaPorNome: a.aplicadaPor.nome,
    data: a.data.toISOString(),
  }))
}

export async function criarAdvertenciaAction(formData: FormData): Promise<void> {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')

  if (!isGestor(session.papel)) {
    throw new Error('Apenas gestores podem aplicar advertências')
  }

  const colaboradorId = formData.get('colaboradorId')?.toString()
  const titulo = formData.get('titulo')?.toString().trim()
  const descricao = formData.get('descricao')?.toString().trim() ?? ''
  const tipo = formData.get('tipo')?.toString()

  if (!colaboradorId) throw new Error('Selecione o colaborador')
  if (!titulo) throw new Error('O título é obrigatório')
  if (!tipo || !['leve', 'media', 'grave'].includes(tipo)) {
    throw new Error('Tipo inválido')
  }

  if (titulo.length > 200) {
    throw new Error('O título deve ter no máximo 200 caracteres')
  }
  if (descricao.length > 2000) {
    throw new Error('A descrição deve ter no máximo 2000 caracteres')
  }

  // Verifica se o colaborador alvo é subordinado direto
  const alvo = await prisma.colaborador.findUnique({
    where: { id: colaboradorId },
    select: { liderImediatoId: true },
  })

  if (!alvo) throw new Error('Colaborador não encontrado')

  // Admins podem advertir qualquer um; gestores apenas subordinados diretos
  const isAdmin = session.papel === 'ADMIN_PLATAFORMA' || session.papel === 'ADMIN_SUPORTE'
  if (!isAdmin && alvo.liderImediatoId !== session.colaboradorId) {
    throw new Error('Você só pode advertir seus subordinados diretos')
  }

  await criarAdvertencia({
    colaboradorId,
    titulo,
    descricao,
    tipo,
    aplicadaPorId: session.colaboradorId,
  })

  revalidatePath('/advertencias')
  redirect('/advertencias')
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
