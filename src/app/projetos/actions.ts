'use server'

import { getSession } from '@/lib/auth'
import { listarProjetosDoColaborador, criarProjeto, atualizarStatusProjeto } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function listarProjetosAction() {
  const session = await getSession()
  if (!session?.colaboradorId) return []
  return listarProjetosDoColaborador(session.colaboradorId)
}

export async function criarProjetoAction(_prevState: unknown, formData: FormData): Promise<{ error: string } | { success: true }> {
  const session = await getSession()
  if (!session?.colaboradorId) return { error: 'Não autorizado' }

  const nome = formData.get('nome')?.toString().trim()
  if (!nome) return { error: 'Nome do projeto é obrigatório' }
  if (nome.length > 200) return { error: 'Nome muito longo' }

  // Parse participantes from JSON hidden field
  let participantes: Array<{
    colaboradorId: string
    responsabilidade: string
    peso: number
  }> = []

  const participantesJson = formData.get('participantes')?.toString()
  if (participantesJson) {
    try {
      participantes = JSON.parse(participantesJson)
    } catch {
      return { error: 'Dados de participantes inválidos' }
    }
  }

  // Validate participantes
  for (const p of participantes) {
    if (!p.colaboradorId || !p.responsabilidade || !p.peso) {
      return { error: 'Todos os participantes devem ter colaborador, responsabilidade e peso' }
    }
    if (p.peso < 1 || p.peso > 5) {
      return { error: 'Peso deve estar entre 1 e 5' }
    }
  }

  await criarProjeto({
    colaboradorId: session.colaboradorId,
    nome,
    descricao: formData.get('descricao')?.toString().trim() ?? '',
    dataInicio: formData.get('dataInicio') ? new Date(formData.get('dataInicio')!.toString()) : undefined,
    dataFim: formData.get('dataFim') ? new Date(formData.get('dataFim')!.toString()) : undefined,
    participantes,
  })

  revalidatePath('/projetos')
  redirect('/projetos')
}

export async function atualizarStatusProjetoAction(id: string, status: string) {
  await atualizarStatusProjeto(id, status)
  revalidatePath('/projetos')
}

export async function listarColaboradoresProjetoAction() {
  const session = await getSession()
  if (!session?.empresaId) return []
  const { listarColaboradoresParaAtribuicao } = await import('@/lib/db')
  return listarColaboradoresParaAtribuicao(session.empresaId)
}

export async function buscarProjetoAction(projetoId: string) {
  const session = await getSession()
  if (!session?.colaboradorId) return null
  const { buscarProjetoComParticipantes } = await import('@/lib/db')
  return buscarProjetoComParticipantes(projetoId)
}
