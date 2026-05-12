'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  criarColaborador,
  listarColaboradores,
  removerColaborador,
  criarAvaliacao,
} from './db'
import { CRITERIOS_AVALIACAO } from './types'

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

export async function criarAvaliacaoAction(formData: FormData) {
  const avaliadorId = formData.get('avaliadorId')?.toString()
  const avaliadoId = formData.get('avaliadoId')?.toString()
  const comentarioGeral = formData.get('comentarioGeral')?.toString() || ''

  if (!avaliadorId || !avaliadoId) return

  const criterios = CRITERIOS_AVALIACAO.map((criterio) => ({
    criterio,
    nota: Number(formData.get(`nota_${criterio}`)) || 1,
  }))

  criarAvaliacao({ avaliadorId, avaliadoId, criterios, comentarioGeral })
  revalidatePath('/avaliacoes')
  redirect('/avaliacoes')
}
