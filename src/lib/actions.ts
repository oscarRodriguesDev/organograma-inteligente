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
import { prisma } from './prisma'
import { CRITERIOS_AVALIACAO, Papel } from './types'
import type { Colaborador } from './types'
import { getSession } from './auth'

export async function cadastrarColaborador(formData: FormData) {
  const nome = formData.get('nome')?.toString().trim()
  const funcao = formData.get('funcao')?.toString().trim()
  const liderImediatoId = formData.get('liderImediatoId')?.toString() || null

  if (!nome || !funcao) return

  const session = await getSession()
  const empresaId = session?.empresaId ?? 'empresa_default'

  // Garante que o cargo existe na lista global
  await garantirCargo(funcao)
  await criarColaborador({ nome, funcao, empresaId, papel: Papel.COLABORADOR, liderImediatoId: liderImediatoId || null })
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

  const removido = await removerColaborador(id)
  if (!removido) throw new Error(`Não foi possível excluir o colaborador ${id}`)

  revalidatePath('/organograma')
  revalidatePath('/colaboradores')
}

export async function adicionarColaboradorRapido(
  nome: string,
  funcao: string,
  liderImediatoId: string | null
) {
  // Valida se o líder ainda existe no banco (evita FK error)
  if (liderImediatoId) {
    const lider = await buscarColaborador(liderImediatoId)
    if (!lider) {
      throw new Error(`O líder informado (${liderImediatoId}) não existe mais. Atualize a página e tente novamente.`)
    }
  }

  const session = await getSession()
  const empresaId = session?.empresaId ?? 'empresa_default'

  const col = await criarColaborador({ nome, funcao, empresaId, papel: Papel.COLABORADOR, liderImediatoId })
  revalidatePath('/organograma')
  revalidatePath('/colaboradores')
  return col
}

export async function atualizarColaboradorAction(id: string, nome: string, funcao: string) {
  await garantirCargo(funcao)
  await atualizarColaborador(id, { nome, funcao })
  revalidatePath('/organograma')
}

export async function aplicarSimulacaoAction(colaboradores: Colaborador[]) {
  const idsSimulacao = new Set(colaboradores.map((c) => c.id))

  const session = await getSession()
  const empresaId = session?.empresaId ?? 'empresa_default'
  const papel = session?.papel ?? Papel.COLABORADOR

  // Consulta IDs que existem no BD antes da simulação
  const existentes = await prisma.colaborador.findMany({
    select: { id: true },
  })
  const idsExistentes = new Set(existentes.map((c) => c.id))

  // 1. Garantir cargos
  for (const col of colaboradores) {
    if (col.funcao) await garantirCargo(col.funcao)
  }

  // 2. Criar/atualizar cada colaborador da simulação
  for (const col of colaboradores) {
    const isVagoSimulacao = col.id.startsWith('vago_')
    const isContratadoSimulacao = col.id.startsWith('contratado_')

    if (isVagoSimulacao) {
      // VAGO criado pela simulação (promoção criou vaga na posição antiga)
      // Só persiste se ainda estiver vago e tiver subordinados (vaga real)
      if (col.status === 'vago') {
        try {
          await prisma.colaborador.create({
            data: {
              id: col.id,
              nome: col.nome,
              funcao: col.funcao,
              empresaId,
              papel: Papel.COLABORADOR,
              liderImediatoId: col.liderImediatoId,
              status: 'vago',
            },
          })
        } catch {
          // Já existe ou deu erro — ignora
        }
      }
    } else if (isContratadoSimulacao) {
      // Novo contratado via simulação
      try {
        await prisma.colaborador.create({
          data: {
            id: col.id,
            nome: col.nome,
            funcao: col.funcao,
            empresaId,
            papel: Papel.COLABORADOR,
            liderImediatoId: col.liderImediatoId,
            status: col.status || 'ativo',
          },
        })
      } catch {
        // Já existe — atualiza
        await atualizarColaborador(col.id, {
          nome: col.nome,
          funcao: col.funcao,
          liderImediatoId: col.liderImediatoId,
          status: col.status,
        })
      }
    } else if (idsExistentes.has(col.id)) {
      // Colaborador real existente → atualiza
      await atualizarColaborador(col.id, {
        nome: col.nome,
        funcao: col.funcao,
        liderImediatoId: col.liderImediatoId,
        status: col.status,
      })
    } else {
      // Colaborador real que não existe (caso raro)
      try {
        await prisma.colaborador.create({
          data: {
            id: col.id,
            nome: col.nome,
            funcao: col.funcao,
            empresaId,
            papel: Papel.COLABORADOR,
            liderImediatoId: col.liderImediatoId,
            status: col.status || 'ativo',
          },
        })
      } catch {
        // Ignora erro
      }
    }
  }

  // 3. Remover colaboradores que existiam no BD mas sumiram da simulação
  //    (ex: cargo demitido que foi preenchido por promoção → VAGO original some)
  for (const id of idsExistentes) {
    if (!idsSimulacao.has(id)) {
      await removerColaborador(id)
    }
  }

  revalidatePath('/organograma')
  revalidatePath('/colaboradores')
}

export async function relocarColaboradorAction(id: string, novoLiderId: string | null) {
  await atualizarColaborador(id, { liderImediatoId: novoLiderId })
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
