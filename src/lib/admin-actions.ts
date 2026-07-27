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
  listarInvestimentos,
  criarInvestimento,
  atualizarInvestimento,
  removerInvestimento,
  obterTotalInvestimentos,
  contarEmpresasAtivas,
  obterTotalColaboradoresSistema,
  obterReceitaMensal,
  obterTotalGastos,
  obterReceitaTotal,
  listarTodosPlanos,
  atualizarPerfilAdmin,
  alterarSenhaAdmin,
  listarAdmins,
  deletarAdmin,
  criarEmpresaPeloAdmin,
  criarAdminSistema,
  listarColaboradoresDaEmpresa,
  redefinirSenhaColaborador,
} from '@/lib/db'
import type { GastoSistema, Investimento } from '@/lib/types'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { atualizarSessao } from '@/lib/auth'

// ─── Guards ─────────────────────────────────────────────
async function verificarAdmin() {
  const session = await getSession()
  if (!session || session.papel !== Papel.ADMIN_PLATAFORMA) {
    redirect('/login')
  }
  return session
}

async function verificarSuporte() {
  const session = await getSession()
  if (!session || (session.papel !== Papel.ADMIN_PLATAFORMA && session.papel !== Papel.ADMIN_SUPORTE && session.papel !== Papel.ADMIN_PSICH)) {
    redirect('/login')
  }
  return session
}

// ─── Empresas ────────────────────────────────────────────

export async function listarEmpresas() {
  await verificarSuporte()
  return listarEmpresasAdmin()
}

export async function buscarEmpresa(id: string) {
  await verificarSuporte()
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
  await verificarAdmin() // apenas admin_system
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

// ─── Investimentos ───────────────────────────────────────

export async function listarInvestimentosAction() {
  await verificarAdmin() // apenas admin_system
  return listarInvestimentos()
}

export async function criarInvestimentoAction(formData: FormData): Promise<void> {
  await verificarAdmin()

  const descricao = formData.get('descricao')?.toString() ?? ''
  const valor = parseFloat(formData.get('valor')?.toString() ?? '0')
  const data = formData.get('data')?.toString() ?? new Date().toISOString().slice(0, 10)

  if (!descricao || valor <= 0) return

  await criarInvestimento({ descricao, valor, data })
  revalidatePath('/admin/investimentos')
  revalidatePath('/admin')
  revalidatePath('/admin/financeiro')
}

export async function atualizarInvestimentoAction(id: string, formData: FormData): Promise<void> {
  await verificarAdmin()

  const descricao = formData.get('descricao')?.toString()
  const valor = formData.get('valor') ? parseFloat(formData.get('valor')!.toString()) : undefined
  const data = formData.get('data')?.toString()

  const dados: any = {}
  if (descricao !== undefined) dados.descricao = descricao
  if (valor !== undefined) dados.valor = valor
  if (data !== undefined) dados.data = data

  await atualizarInvestimento(id, dados)
  revalidatePath('/admin/investimentos')
}

export async function removerInvestimentoAction(id: string): Promise<void> {
  await verificarAdmin()
  await removerInvestimento(id)
  revalidatePath('/admin/investimentos')
  revalidatePath('/admin')
  revalidatePath('/admin/financeiro')
}

// ─── Dashboard / Financeiro ─────────────────────────────

export async function obterDadosDashboard() {
  await verificarAdmin()
  const now = new Date()
  const mes = now.getMonth() + 1
  const ano = now.getFullYear()

  const [totalEmpresasAtivas, totalColaboradores, receitaMes, gastosMes, totalInvestimentos] = await Promise.all([
    contarEmpresasAtivas(),
    obterTotalColaboradoresSistema(),
    obterReceitaMensal(mes, ano),
    obterTotalGastos(mes, ano),
    obterTotalInvestimentos(),
  ])

  return { totalEmpresasAtivas, totalColaboradores, receitaMes, gastosMes, totalInvestimentos }
}

export async function obterDadosFinanceiros() {
  await verificarAdmin()

  const [receitaTotal, gastosTotal, totalInvestimentos] = await Promise.all([
    obterReceitaTotal(),
    obterTotalGastos(),
    obterTotalInvestimentos(),
  ])
  const lucroLiquido = receitaTotal - gastosTotal
  const roi = totalInvestimentos > 0 ? ((receitaTotal - gastosTotal) / totalInvestimentos) * 100 : 0
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

  return { receitaTotal, gastosTotal, lucroLiquido, roi, payback, meses, totalInvestimentos }
}

// ─── Perfil do Admin ──────────────────────────────────────

export async function obterInfoAdmin() {
  const session = await verificarSuporte()
  const admin = await prisma.colaborador.findUnique({
    where: { id: session.colaboradorId },
    select: {
      id: true,
      nome: true,
      email: true,
      username: true,
      fotoUrl: true,
      tema: true,
      createdAt: true,
    },
  })
  if (!admin) throw new Error('Usuário não encontrado')
  return {
    ...admin,
    createdAt: admin.createdAt.toISOString(),
  }
}

export async function atualizarPerfilAction(formData: FormData): Promise<string> {
  const session = await verificarSuporte()

  const nome = formData.get('nome')?.toString()
  const username = formData.get('username')?.toString()
  const tema = formData.get('tema')?.toString()

  const dados: any = {}
  if (nome) dados.nome = nome
  if (username) dados.username = username
  if (tema && ['light', 'dark', 'system'].includes(tema)) dados.tema = tema

  await atualizarPerfilAdmin(session.colaboradorId, dados)

  // Atualiza a sessão com novos dados
  const novoSession = { ...session }
  if (nome) novoSession.nome = nome
  if (username) novoSession.username = username
  if (tema) novoSession.tema = tema
  const novoToken = await atualizarSessao(novoSession)
  if (novoToken) {
    const cookieStore = await cookies()
    cookieStore.set('session', novoToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })
    // Atualiza cookie de tema
    if (tema) {
      cookieStore.set('tema', tema, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      })
    }
  }

  revalidatePath('/admin/perfil')
  revalidatePath('/admin')
  return 'ok'
}

export async function alterarSenhaAction(formData: FormData): Promise<{ ok: boolean; erro?: string }> {
  const session = await verificarSuporte()
  const senhaAtual = formData.get('senhaAtual')?.toString() ?? ''
  const novaSenha = formData.get('novaSenha')?.toString() ?? ''
  const confirmarSenha = formData.get('confirmarSenha')?.toString() ?? ''

  if (!senhaAtual || !novaSenha || !confirmarSenha) {
    return { ok: false, erro: 'Preencha todos os campos' }
  }
  if (novaSenha.length < 6) {
    return { ok: false, erro: 'A nova senha deve ter no mínimo 6 caracteres' }
  }
  if (novaSenha !== confirmarSenha) {
    return { ok: false, erro: 'A confirmação não confere' }
  }

  return alterarSenhaAdmin(session.colaboradorId, senhaAtual, novaSenha)
}

// ─── Admin: Gerenciar Usuários Admin ─────────────────────

export async function listarAdminsAction() {
  await verificarAdmin()
  return listarAdmins()
}

export async function criarAdminAction(formData: FormData): Promise<{ ok: boolean; erro?: string }> {
  await verificarAdmin()
  const nome = formData.get('nome')?.toString().trim() ?? ''
  const email = formData.get('email')?.toString() ?? ''
  const senha = formData.get('senha')?.toString() ?? ''
  const papel = formData.get('papel')?.toString() ?? 'ADMIN_PLATAFORMA'

  if (!nome || !email || !senha) return { ok: false, erro: 'Preencha todos os campos' }
  if (nome.length > 120) return { ok: false, erro: 'Nome deve ter no máximo 120 caracteres' }
  if (senha.length < 6) return { ok: false, erro: 'A senha deve ter no mínimo 6 caracteres' }
  if (papel !== 'ADMIN_PLATAFORMA' && papel !== 'ADMIN_SUPORTE' && papel !== 'ADMIN_PSICH') return { ok: false, erro: 'Papel inválido' }

  const criado = await criarAdminSistema({ nome, email, senha, papel: papel as 'ADMIN_PLATAFORMA' | 'ADMIN_SUPORTE' | 'ADMIN_PSICH' })
  if (!criado) return { ok: false, erro: 'Email já cadastrado' }

  revalidatePath('/admin/usuarios')
  return { ok: true }
}

export async function deletarAdminAction(id: string): Promise<{ ok: boolean; erro?: string }> {
  const session = await verificarAdmin()
  if (session.colaboradorId === id) return { ok: false, erro: 'Você não pode excluir seu próprio usuário' }

  const removido = await deletarAdmin(id)
  if (!removido) return { ok: false, erro: 'Erro ao excluir admin' }

  revalidatePath('/admin/usuarios')
  return { ok: true }
}

// ─── Admin: Criar Empresa ─────────────────────────────────

export async function criarEmpresaAdminAction(formData: FormData): Promise<{ ok: boolean; erro?: string }> {
  await verificarSuporte()

  const empresaNome = formData.get('empresaNome')?.toString() ?? ''
  const empresaSlug = formData.get('empresaSlug')?.toString() ?? ''
  const ceoNome = formData.get('ceoNome')?.toString() ?? ''
  const ceoEmail = formData.get('ceoEmail')?.toString() ?? ''
  const ceoSenha = formData.get('ceoSenha')?.toString() ?? ''

  if (!empresaNome || !empresaSlug || !ceoNome || !ceoEmail || !ceoSenha) {
    return { ok: false, erro: 'Preencha todos os campos' }
  }
  if (ceoNome.length > 120) return { ok: false, erro: 'Nome do CEO deve ter no máximo 120 caracteres' }
  if (ceoSenha.length < 6) return { ok: false, erro: 'A senha do CEO deve ter no mínimo 6 caracteres' }

  const result = await criarEmpresaPeloAdmin({ empresaNome, empresaSlug, ceoNome, ceoEmail, ceoSenha })
  if (result.ok) {
    revalidatePath('/admin/empresas')
    revalidatePath('/admin')
  }
  return result
}

// ─── Planos ──────────────────────────────────────────────

export async function obterPlanos() {
  await verificarAdmin()
  return listarTodosPlanos()
}

// ─── Suporte: Redefinir Senha de Colaborador ────────────

export async function listarColaboradoresEmpresaAction(empresaId: string) {
  await verificarSuporte()
  return listarColaboradoresDaEmpresa(empresaId)
}

export async function redefinirSenhaColaboradorAction(
  colaboradorId: string,
  novaSenha: string
): Promise<{ ok: boolean; erro?: string }> {
  const session = await verificarSuporte()

  // ADMIN_PSICH não pode redefinir senhas
  if (session.papel === Papel.ADMIN_PSICH) {
    return { ok: false, erro: 'Apenas Administrador e Suporte podem redefinir senhas' }
  }

  if (novaSenha.length < 6) {
    return { ok: false, erro: 'A nova senha deve ter no mínimo 6 caracteres' }
  }

  const result = await redefinirSenhaColaborador(colaboradorId, novaSenha)
  if (result.ok) {
    revalidatePath('/admin/empresas')
  }
  return result
}
