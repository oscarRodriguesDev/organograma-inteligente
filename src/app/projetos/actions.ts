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

  await criarProjeto({
    colaboradorId: session.colaboradorId,
    nome,
    descricao: formData.get('descricao')?.toString().trim() ?? '',
    dataInicio: formData.get('dataInicio') ? new Date(formData.get('dataInicio')!.toString()) : undefined,
    dataFim: formData.get('dataFim') ? new Date(formData.get('dataFim')!.toString()) : undefined,
  })

  revalidatePath('/projetos')
  redirect('/projetos')
}

export async function atualizarStatusProjetoAction(id: string, status: string) {
  await atualizarStatusProjeto(id, status)
  revalidatePath('/projetos')
}
