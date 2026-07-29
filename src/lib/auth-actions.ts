'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { criarToken, autenticarPorEmailSenha } from './auth'
import { Papel } from './types'

const COOKIE_NAME = 'session'
const SESSION_DURATION = 60 * 60 * 24 // 24h

export async function loginAction(formData: FormData) {
  const email = formData.get('email')?.toString().trim() ?? ''
  const password = formData.get('password')?.toString() ?? ''

  if (!email || !password) {
    redirect('/login?erro=1')
  }

  const session = await autenticarPorEmailSenha(email, password)
  if (!session) {
    redirect('/login?erro=1')
  }

  const token = await criarToken(session)
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })
  // Tema cookie (não httpOnly para o cliente ler)
  cookieStore.set('tema', session.tema ?? 'system', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })

  revalidatePath('/')
  // Redireciona admin para /admin, outros para Meu Desempenho
  if (session.papel === Papel.ADMIN_PLATAFORMA || session.papel === Papel.ADMIN_SUPORTE || session.papel === Papel.ADMIN_PSICH) {
    redirect('/admin')
  }
  redirect('/meu-desempenho')
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  revalidatePath('/')
  redirect('/login')
}
