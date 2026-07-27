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

// ─── Helpers de validação ─────────────────────────
const MAX_NOME_LENGTH = 120
const CPF_LENGTH = 11

function validarNome(nome: string): string | null {
  if (!nome.trim()) return 'Nome é obrigatório'
  if (nome.trim().length > MAX_NOME_LENGTH) return `Nome deve ter no máximo ${MAX_NOME_LENGTH} caracteres`
  return null
}

function validarCPF(cpf?: string): string | null {
  if (!cpf) return null // CPF é opcional
  const digitos = cpf.replace(/\D/g, '')
  if (digitos.length !== CPF_LENGTH) return `CPF deve ter exatamente ${CPF_LENGTH} dígitos numéricos`
  return null
}

export async function cadastrarColaborador(formData: FormData) {
  const nome = formData.get('nome')?.toString().trim() ?? ''
  const funcao = formData.get('funcao')?.toString().trim() ?? ''
  const liderImediatoId = formData.get('liderImediatoId')?.toString() || null
  const cpf = formData.get('cpf')?.toString().trim() || undefined
  const papelStr = formData.get('papel')?.toString().trim() || undefined

  const erroNome = validarNome(nome)
  if (erroNome) throw new Error(erroNome)
  if (!funcao) throw new Error('Função é obrigatória')

  const erroCPF = validarCPF(cpf)
  if (erroCPF) throw new Error(erroCPF)

  const session = await getSession()
  const empresaId = session?.empresaId
  if (!empresaId) return

  // Garante que o cargo existe na lista global
  await garantirCargo(funcao, empresaId)

  // Se informou papel, valida e usa; senão, deixa o criarColaborador calcular
  if (papelStr) {
    if (!Object.values(Papel).includes(papelStr as Papel)) {
      throw new Error(`Papel inválido: ${papelStr}`)
    }
    await criarColaborador({ nome, funcao, empresaId, papel: papelStr as Papel, liderImediatoId: liderImediatoId || null, cpf })
  } else {
    await criarColaborador({ nome, funcao, empresaId, liderImediatoId: liderImediatoId || null, cpf })
  }
  revalidatePath('/colaboradores')
  revalidatePath('/organograma')
  redirect('/colaboradores')
}

export async function editarColaboradorAction(formData: FormData) {
  const id = formData.get('id')?.toString()
  if (!id) throw new Error('ID não fornecido')

  const nome = formData.get('nome')?.toString().trim() ?? ''
  const funcao = formData.get('funcao')?.toString().trim() ?? ''
  const liderImediatoId = formData.get('liderImediatoId')?.toString() || null

  const erroNome = validarNome(nome)
  if (erroNome) throw new Error(erroNome)
  if (!funcao.trim()) throw new Error('Função é obrigatória')

  const session = await getSession()
  await garantirCargo(funcao, session?.empresaId)
  await atualizarColaborador(id, { nome, funcao, liderImediatoId })
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
  liderImediatoId: string | null,
  cpf?: string,
  papel?: Papel
) {
  const erroNome = validarNome(nome)
  if (erroNome) throw new Error(erroNome)
  if (!funcao.trim()) throw new Error('Função é obrigatória')
  const erroCPF = validarCPF(cpf)
  if (erroCPF) throw new Error(erroCPF)

  // Valida se o líder ainda existe no banco (evita FK error)
  if (liderImediatoId) {
    const lider = await buscarColaborador(liderImediatoId)
    if (!lider) {
      throw new Error(`O líder informado (${liderImediatoId}) não existe mais. Atualize a página e tente novamente.`)
    }
  }

  const session = await getSession()
  const empresaId = session?.empresaId ?? 'empresa_default'

  // Se não informou papel, o criarColaborador calcula automaticamente baseado no líder
  const col = await criarColaborador({ nome, funcao, empresaId, papel, liderImediatoId, cpf })
  revalidatePath('/organograma')
  revalidatePath('/colaboradores')
  return col
}

export async function atualizarColaboradorAction(
  id: string,
  nome: string,
  funcao: string,
  papel?: Papel
) {
  const erroNome = validarNome(nome)
  if (erroNome) throw new Error(erroNome)
  if (!funcao.trim()) throw new Error('Função é obrigatória')

  const session = await getSession()
  await garantirCargo(funcao, session?.empresaId)

  const dados: any = { nome, funcao }
  if (papel !== undefined) dados.papel = papel

  await atualizarColaborador(id, dados)
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
    if (col.funcao) await garantirCargo(col.funcao, empresaId !== 'empresa_default' ? empresaId : undefined)
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
              papel: Papel.OPERACIONAL,
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
            papel: Papel.OPERACIONAL,
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
            papel: Papel.OPERACIONAL,
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

export async function atualizarPapelColaboradorAction(id: string, papel: Papel) {
  await atualizarColaborador(id, { papel })
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
  const session = await getSession()
  await garantirCargo(nome, session?.empresaId)
  revalidatePath('/colaboradores/novo')
  revalidatePath('/organograma')
}
