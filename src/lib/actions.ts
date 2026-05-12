'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  atualizarColaborador,
  buscarColaborador,
  criarColaborador,
  listarColaboradores,
  removerColaborador,
  criarAvaliacao,
  criarIniciativa,
  criarMetrica,
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

export async function excluirColaboradorComSubordinados(id: string) {
  const colaborador = buscarColaborador(id)
  if (!colaborador) return

  const todos = listarColaboradores()
  const subordinados = todos.filter((c) => c.liderImediatoId === id)

  for (const sub of subordinados) {
    atualizarColaborador(sub.id, { liderImediatoId: colaborador.liderImediatoId })
  }

  removerColaborador(id)
  revalidatePath('/organograma')
  revalidatePath('/colaboradores')
}

export async function adicionarColaboradorRapido(
  nome: string,
  funcao: string,
  liderImediatoId: string | null
) {
  const col = criarColaborador({ nome, funcao, liderImediatoId })
  revalidatePath('/organograma')
  revalidatePath('/colaboradores')
  return col
}

export async function atualizarColaboradorAction(id: string, nome: string, funcao: string) {
  atualizarColaborador(id, { nome, funcao })
  revalidatePath('/organograma')
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

export async function cadastrarIniciativa(formData: FormData) {
  const colaboradorId = formData.get('colaboradorId')?.toString()
  const titulo = formData.get('titulo')?.toString().trim()
  const descricao = formData.get('descricao')?.toString().trim()
  const resultado = formData.get('resultado')?.toString().trim()
  const valorResultado = Number(formData.get('valorResultado')) || 0
  const unidadeMedida = formData.get('unidadeMedida')?.toString().trim() || ''

  if (!colaboradorId || !titulo) return

  criarIniciativa({
    colaboradorId, titulo,
    descricao: descricao || '',
    resultado: resultado || '',
    valorResultado,
    unidadeMedida,
  })
  revalidatePath('/iniciativas')
  redirect('/iniciativas')
}

export async function cadastrarMetrica(formData: FormData) {
  const colaboradorId = formData.get('colaboradorId')?.toString()
  const mes = Number(formData.get('mes'))
  const ano = Number(formData.get('ano'))
  const diasTrabalhados = Number(formData.get('diasTrabalhados')) || 0
  const faltasInjustificadas = Number(formData.get('faltasInjustificadas')) || 0
  const horasAtraso = Number(formData.get('horasAtraso')) || 0
  const observacao = formData.get('observacao')?.toString().trim() || ''

  if (!colaboradorId || !mes || !ano) return

  criarMetrica({ colaboradorId, mes, ano, diasTrabalhados, faltasInjustificadas, horasAtraso, observacao })
  revalidatePath('/metricas')
  redirect('/metricas')
}
