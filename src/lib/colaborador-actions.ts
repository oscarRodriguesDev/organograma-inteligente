'use server'

import { revalidatePath } from 'next/cache'
import { getSession, atualizarSessao } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { obterAcoesColaborador } from '@/lib/permissions'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

async function verificarSessao() {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')
  return session
}

export async function atualizarPerfilColaboradorAction(formData: FormData): Promise<string> {
  const session = await verificarSessao()

  const nome = formData.get('nome')?.toString().trim()
  const username = formData.get('username')?.toString()
  const tema = formData.get('tema')?.toString()

  const dados: any = {}
  if (nome) {
    if (nome.length > 120) throw new Error('Nome deve ter no máximo 120 caracteres')
    dados.nome = nome
  }
  if (username) dados.username = username
  if (tema && ['light', 'dark', 'system'].includes(tema)) dados.tema = tema

  await prisma.colaborador.update({
    where: { id: session.colaboradorId },
    data: dados,
  })

  // Atualiza a sessão
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

  revalidatePath('/perfil')
  return 'ok'
}

export async function alterarSenhaColaboradorAction(formData: FormData): Promise<{ ok: boolean; erro?: string }> {
  const session = await verificarSessao()

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

  const colaborador = await prisma.colaborador.findUnique({ where: { id: session.colaboradorId } })
  if (!colaborador || !colaborador.senhaHash) {
    return { ok: false, erro: 'Usuário não encontrado' }
  }

  const valida = await bcrypt.compare(senhaAtual, colaborador.senhaHash)
  if (!valida) {
    return { ok: false, erro: 'Senha atual incorreta' }
  }

  const senhaHash = await bcrypt.hash(novaSenha, 10)
  await prisma.colaborador.update({
    where: { id: session.colaboradorId },
    data: { senhaHash },
  })

  revalidatePath('/perfil')
  return { ok: true }
}

export async function obterInfoPerfil() {
  const session = await verificarSessao()
  const colaborador = await prisma.colaborador.findUnique({
    where: { id: session.colaboradorId },
    select: {
      id: true,
      nome: true,
      email: true,
      cpf: true,
      funcao: true,
      papel: true,
      username: true,
      fotoUrl: true,
      tema: true,
      createdAt: true,
      liderImediatoId: true,
      empresaId: true,
    },
  })
  if (!colaborador) throw new Error('Colaborador não encontrado')

  const acoes = obterAcoesColaborador(colaborador.papel as any)

  // Busca nome do líder
  let liderNome: string | null = null
  if (colaborador.liderImediatoId) {
    const lider = await prisma.colaborador.findUnique({
      where: { id: colaborador.liderImediatoId },
      select: { nome: true },
    })
    liderNome = lider?.nome ?? null
  }

  return {
    ...colaborador,
    papel: colaborador.papel as string,
    createdAt: colaborador.createdAt.toISOString(),
    acoes,
    liderNome,
  }
}
