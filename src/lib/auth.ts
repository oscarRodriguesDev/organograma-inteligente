import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET ?? 'fallback-secret')
const COOKIE_NAME = 'session'
const SESSION_DURATION = 60 * 60 * 24 // 24h

export interface SessionPayload {
  username: string
  nome: string
}

export async function criarToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(SECRET)
}

export async function verificarToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verificarToken(token)
}

export function validarCredenciais(
  username: string,
  password: string
): SessionPayload | null {
  if (
    username === process.env.AUTH_USERNAME &&
    password === process.env.AUTH_PASSWORD
  ) {
    return {
      username,
      nome: username.charAt(0).toUpperCase() + username.slice(1).replace('.', ' '),
    }
  }
  return null
}
