'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { criarColaborador, listarColaboradores, removerColaborador } from './db'

export async function cadastrarColaborador(formData: FormData) {
  const nome = formData.get('nome')?.toString().trim()
  const funcao = formData.get('funcao')?.toString().trim()
  const liderImediatoId = formData.get('liderImediatoId')?.toString() || null

  if (!nome || !funcao) return

  criarColaborador({ nome, funcao, liderImediatoId: liderImediatoId || null })
  revalidatePath('/colaboradores')
  redirect('/colaboradores')
}

export async function excluirColaborador(id: string) {
  removerColaborador(id)
  revalidatePath('/colaboradores')
}

export async function listarPossiveisLideres() {
  return listarColaboradores()
}
