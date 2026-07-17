import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import type { UsuarioSessao } from './types'
import { Papel } from './types'
import bcrypt from 'bcryptjs'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'fallback-secret-change-me')
const COOKIE_NAME = 'session'
const SESSION_DURATION = 60 * 60 * 24 // 24h

export interface SessionPayload {
  colaboradorId: string
  empresaId: string
  empresaNome: string
  nome: string
  email: string
  papel: Papel
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

export async function autenticarPorEmailSenha(
  email: string,
  senha: string
): Promise<SessionPayload | null> {
  // Busca colaborador pelo email (qualquer empresa)
  const colaborador = await prisma.colaborador.findFirst({
    where: { email },
    include: { empresa: true },
  })

  if (!colaborador || !colaborador.senhaHash) return null

  const senhaValida = await bcrypt.compare(senha, colaborador.senhaHash)
  if (!senhaValida) return null

  if (!colaborador.empresa.ativa) return null
  if (colaborador.status !== 'ativo') return null

  return {
    colaboradorId: colaborador.id,
    empresaId: colaborador.empresaId,
    empresaNome: colaborador.empresa.nome,
    nome: colaborador.nome,
    email: colaborador.email!,
    papel: colaborador.papel as Papel,
  }
}

export function validarPermissao(
  session: SessionPayload | null,
  papeisPermitidos: Papel[]
): boolean {
  if (!session) return false
  if (session.papel === Papel.ADMIN_PLATAFORMA) return true // admin passa em tudo
  return papeisPermitidos.includes(session.papel)
}
