'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { criarToken, validarCredenciais } from './auth'

const COOKIE_NAME = 'session'
const SESSION_DURATION = 60 * 60 * 24 // 24h

export async function loginAction(formData: FormData) {
  const username = formData.get('username')?.toString().trim() ?? ''
  const password = formData.get('password')?.toString() ?? ''

  const session = validarCredenciais(username, password)
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

  revalidatePath('/')
  redirect('/')
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  revalidatePath('/')
  redirect('/login')
}
