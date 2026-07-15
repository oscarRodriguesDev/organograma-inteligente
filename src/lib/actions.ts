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
  listarCargos,
  garantirCargo,
} from './db'
import { CRITERIOS_AVALIACAO } from './types'
import type { Colaborador } from './types'

export async function cadastrarColaborador(formData: FormData) {
  const nome = formData.get('nome')?.toString().trim()
  const funcao = formData.get('funcao')?.toString().trim()
  const liderImediatoId = formData.get('liderImediatoId')?.toString() || null

  if (!nome || !funcao) return

  // Garante que o cargo existe na lista global
  await garantirCargo(funcao)
  await criarColaborador({ nome, funcao, liderImediatoId: liderImediatoId || null })
  revalidatePath('/colaboradores')
  revalidatePath('/organograma')
  redirect('/colaboradores')
}

export async function excluirColaborador(id: string) {
  await removerColaborador(id)
  revalidatePath('/colaboradores')
}

export async function excluirColaboradorComSubordinados(id: string) {
  const colaborador = await buscarColaborador(id)
  if (!colaborador) return

  const todos = await listarColaboradores()
  const subordinados = todos.filter((c) => c.liderImediatoId === id)

  for (const sub of subordinados) {
    await atualizarColaborador(sub.id, { liderImediatoId: colaborador.liderImediatoId })
  }

  await removerColaborador(id)
  revalidatePath('/organograma')
  revalidatePath('/colaboradores')
}

export async function adicionarColaboradorRapido(
  nome: string,
  funcao: string,
  liderImediatoId: string | null
) {
  const col = await criarColaborador({ nome, funcao, liderImediatoId })
  revalidatePath('/organograma')
  revalidatePath('/colaboradores')
  return col
}

export async function atualizarColaboradorAction(id: string, nome: string, funcao: string) {
  await atualizarColaborador(id, { nome, funcao })
  revalidatePath('/organograma')
}

export async function aplicarSimulacaoAction(colaboradores: Colaborador[]) {
  // Persiste via Prisma — atualiza todos os registros
  const ids = colaboradores.map((c) => c.id)
  for (const col of colaboradores) {
    await atualizarColaborador(col.id, {
      nome: col.nome,
      funcao: col.funcao,
      liderImediatoId: col.liderImediatoId,
      status: col.status,
    })
  }
  revalidatePath('/organograma')
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

  await criarAvaliacao({ avaliadorId, avaliadoId, criterios, comentarioGeral })
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

  await criarIniciativa({
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

  await criarMetrica({ colaboradorId, mes, ano, diasTrabalhados, faltasInjustificadas, horasAtraso, observacao })
  revalidatePath('/metricas')
  redirect('/metricas')
}

export async function listarCargosAction() {
  return listarCargos()
}

export async function adicionarCargoAction(formData: FormData) {
  const nome = formData.get('nome')?.toString().trim()
  if (!nome) return
  await garantirCargo(nome)
  revalidatePath('/colaboradores/novo')
  revalidatePath('/organograma')
}
