'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Papel } from '@/lib/types'
import {
  listarEmpresasAdmin,
  buscarEmpresaAdmin,
  alternarStatusEmpresa,
  deletarEmpresaAdmin,
  listarGastosSistema,
  criarGastoSistema,
  atualizarGastoSistema,
  removerGastoSistema,
  contarEmpresasAtivas,
  obterTotalColaboradoresSistema,
  obterReceitaMensal,
  obterTotalGastos,
  obterReceitaTotal,
  listarPlanos,
} from '@/lib/db'
import type { GastoSistema } from '@/lib/types'

// ─── Guard ───────────────────────────────────────────────
async function verificarAdmin() {
  const session = await getSession()
  if (!session || session.papel !== Papel.ADMIN_PLATAFORMA) {
    redirect('/login')
  }
  return session
}

// ─── Empresas ────────────────────────────────────────────

export async function listarEmpresas() {
  await verificarAdmin()
  return listarEmpresasAdmin()
}

export async function buscarEmpresa(id: string) {
  await verificarAdmin()
  return buscarEmpresaAdmin(id)
}

export async function alternarStatusEmpresaAction(id: string, ativa: boolean): Promise<void> {
  await verificarAdmin()
  const ok = await alternarStatusEmpresa(id, ativa)
  if (ok) revalidatePath('/admin/empresas')
}

export async function deletarEmpresaAction(id: string): Promise<void> {
  await verificarAdmin()
  await deletarEmpresaAdmin(id)
  revalidatePath('/admin/empresas')
  revalidatePath('/admin')
}

// ─── Gastos do Sistema ──────────────────────────────────

export async function listarGastos(mes?: number, ano?: number) {
  await verificarAdmin()
  return listarGastosSistema(mes, ano)
}

export async function criarGastoSistemaAction(formData: FormData): Promise<void> {
  await verificarAdmin()

  const tipo = formData.get('tipo')?.toString() ?? ''
  const descricao = formData.get('descricao')?.toString() ?? ''
  const valor = parseFloat(formData.get('valor')?.toString() ?? '0')
  const mes = parseInt(formData.get('mes')?.toString() ?? '1')
  const ano = parseInt(formData.get('ano')?.toString() ?? new Date().getFullYear().toString())
  const recorrente = formData.get('recorrente') === 'on'
  const fornecedor = formData.get('fornecedor')?.toString() ?? ''
  const observacao = formData.get('observacao')?.toString() ?? ''

  if (!tipo || !descricao || valor <= 0) {
    return
  }

  const tiposValidos = ['dominio', 'hospedagem', 'anuncio', 'salario', 'ia', 'ferramentas', 'outros']
  if (!tiposValidos.includes(tipo)) {
    return
  }

  await criarGastoSistema({ tipo, descricao, valor, mes, ano, recorrente, fornecedor, observacao } as GastoSistema)
  revalidatePath('/admin/gastos')
}

export async function atualizarGastoSistemaAction(id: string, formData: FormData): Promise<void> {
  await verificarAdmin()

  const tipo = formData.get('tipo')?.toString()
  const descricao = formData.get('descricao')?.toString()
  const valor = formData.get('valor') ? parseFloat(formData.get('valor')!.toString()) : undefined
  const mes = formData.get('mes') ? parseInt(formData.get('mes')!.toString()) : undefined
  const ano = formData.get('ano') ? parseInt(formData.get('ano')!.toString()) : undefined
  const recorrente = formData.get('recorrente') === 'on'
  const fornecedor = formData.get('fornecedor')?.toString()
  const observacao = formData.get('observacao')?.toString()

  const dados: any = {}
  if (tipo !== undefined) dados.tipo = tipo
  if (descricao !== undefined) dados.descricao = descricao
  if (valor !== undefined) dados.valor = valor
  if (mes !== undefined) dados.mes = mes
  if (ano !== undefined) dados.ano = ano
  dados.recorrente = recorrente
  if (fornecedor !== undefined) dados.fornecedor = fornecedor
  if (observacao !== undefined) dados.observacao = observacao

  await atualizarGastoSistema(id, dados)
  revalidatePath('/admin/gastos')
}

export async function removerGastoSistemaAction(id: string): Promise<void> {
  await verificarAdmin()
  await removerGastoSistema(id)
  revalidatePath('/admin/gastos')
  revalidatePath('/admin/financeiro')
}

// ─── Dashboard / Financeiro ─────────────────────────────

export async function obterDadosDashboard() {
  await verificarAdmin()
  const now = new Date()
  const mes = now.getMonth() + 1
  const ano = now.getFullYear()

  const [totalEmpresasAtivas, totalColaboradores, receitaMes, gastosMes] = await Promise.all([
    contarEmpresasAtivas(),
    obterTotalColaboradoresSistema(),
    obterReceitaMensal(mes, ano),
    obterTotalGastos(mes, ano),
  ])

  return { totalEmpresasAtivas, totalColaboradores, receitaMes, gastosMes }
}

export async function obterDadosFinanceiros() {
  await verificarAdmin()

  const receitaTotal = await obterReceitaTotal()
  const gastosTotal = await obterTotalGastos()
  const lucroLiquido = receitaTotal - gastosTotal
  const roi = gastosTotal > 0 ? ((receitaTotal - gastosTotal) / gastosTotal) * 100 : 0
  const receitaMensalMedia = receitaTotal / 12
  const payback = receitaMensalMedia > 0 ? gastosTotal / receitaMensalMedia : 0

  // Receita vs Gasto por mês (últimos 12 meses)
  const meses: { mes: number; ano: number; receita: number; gasto: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const m = d.getMonth() + 1
    const a = d.getFullYear()
    const [receita, gasto] = await Promise.all([
      obterReceitaMensal(m, a),
      obterTotalGastos(m, a),
    ])
    meses.push({ mes: m, ano: a, receita, gasto })
  }

  return { receitaTotal, gastosTotal, lucroLiquido, roi, payback, meses }
}

// ─── Planos ──────────────────────────────────────────────

export async function obterPlanos() {
  await verificarAdmin()
  return listarPlanos()
}
