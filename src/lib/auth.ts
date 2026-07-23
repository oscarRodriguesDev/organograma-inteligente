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
  tema?: string
  fotoUrl?: string
  username?: string
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
  // Busca por email OU username
  const colaborador = await prisma.colaborador.findFirst({
    where: {
      OR: [
        { email },
        { username: email },
      ],
    },
    include: { empresa: true },
  })

  if (!colaborador || !colaborador.senhaHash) return null

  const senhaValida = await bcrypt.compare(senha, colaborador.senhaHash)
  if (!senhaValida) return null

  // Admins da plataforma (ADMIN_PLATAFORMA, ADMIN_SUPORTE, ADMIN_PSICH) podem ter empresaId null
  if (colaborador.papel === 'ADMIN_PLATAFORMA' || colaborador.papel === 'ADMIN_SUPORTE' || colaborador.papel === 'ADMIN_PSICH') {
    if (colaborador.status !== 'ativo') return null
  } else {
    if (!colaborador.empresa?.ativa) return null
    if (colaborador.status !== 'ativo') return null
  }

  return {
    colaboradorId: colaborador.id,
    empresaId: colaborador.empresaId ?? '',
    empresaNome: colaborador.empresa?.nome ?? 'Sistema',
    nome: colaborador.nome,
    email: colaborador.email!,
    papel: colaborador.papel as Papel,
    tema: colaborador.tema ?? 'system',
    fotoUrl: colaborador.fotoUrl ?? undefined,
    username: colaborador.username ?? undefined,
  }
}

export async function atualizarSessao(dados: Partial<SessionPayload>): Promise<string | null> {
  const session = await getSession()
  if (!session) return null
  const novaSession = { ...session, ...dados }
  return criarToken(novaSession)
}

/** Hierarquia de permissões: quanto maior o índice, mais permissões */
const HIERARQUIA_PERMISSOES: Record<Papel, number> = {
  [Papel.OPERACIONAL]: 1,
  [Papel.COLABORADOR]: 1,
  [Papel.RH]: 2,
  [Papel.LIDER]: 3,
  [Papel.GESTOR]: 4,
  [Papel.SUPERVISOR]: 5,
  [Papel.GERENTE]: 6,
  [Papel.DIRETOR]: 7,
  [Papel.CEO]: 8,
  [Papel.ADMIN_SUPORTE]: 9,
  [Papel.ADMIN_PSICH]: 9,
  [Papel.ADMIN_PLATAFORMA]: 10,
}

export function validarPermissao(
  session: SessionPayload | null,
  papeisPermitidos: Papel[]
): boolean {
  if (!session) return false

  // ADMIN_PLATAFORMA passa em tudo
  if (session.papel === Papel.ADMIN_PLATAFORMA) return true

  // ADMIN_SUPORTE tem nível 9, passa em tudo abaixo de ADMIN_PLATAFORMA
  if (session.papel === Papel.ADMIN_SUPORTE) {
    return papeisPermitidos.some(p => HIERARQUIA_PERMISSOES[p] <= HIERARQUIA_PERMISSOES[Papel.ADMIN_SUPORTE])
  }

  // Verifica se o papel da sessão tem nível suficiente para algum dos papéis permitidos
  const nivelSessao = HIERARQUIA_PERMISSOES[session.papel] ?? 0
  return papeisPermitidos.some(p => nivelSessao >= (HIERARQUIA_PERMISSOES[p] ?? 0))
}

/** Retorna true se o papel da sessão está na hierarquia permitida OU acima dela */
export function nivelMinimo(session: SessionPayload | null, papelMinimo: Papel): boolean {
  if (!session) return false
  if (session.papel === Papel.ADMIN_PLATAFORMA) return true
  const nivelSessao = HIERARQUIA_PERMISSOES[session.papel] ?? 0
  const nivelMinimo = HIERARQUIA_PERMISSOES[papelMinimo] ?? 0
  return nivelSessao >= nivelMinimo
}
