import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'fallback-secret-change-me')
const SESSION_DURATION = 60 * 60 // 1 hora

export interface PaymentSessionPayload {
  pagamentoId: string
  planoId: string
  ciclo: string
  metodo: 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'mock'
}

/**
 * Gera um token de sessão de pagamento assinado.
 * Esse token é a única prova de que o checkout foi processado.
 * Não pode ser forjado sem a chave JWT_SECRET.
 */
export async function gerarSessionToken(payload: PaymentSessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(SECRET)
}

/**
 * Verifica e decodifica um token de sessão de pagamento.
 * Retorna null se o token for inválido, expirado ou adulterado.
 */
export async function verificarSessionToken(
  token: string
): Promise<PaymentSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as PaymentSessionPayload
  } catch {
    return null
  }
}
