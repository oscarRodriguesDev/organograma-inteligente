/**
 * Serviço de integração com o Asaas (Checkout).
 *
 * Arquitetura:
 * - Toda comunicação com a API do Asaas é feita exclusivamente no servidor
 * - A chave ASAAS_API_KEY fica protegida no .env.local
 * - O fluxo usa o Checkout Asaas (página hospedada) para planos reais
 * - O plano "mock" usa simulação local para testes
 */

import { createHmac, timingSafeEqual } from 'crypto'
import { config } from 'dotenv'
config({ override: true })

const ASAAS_API_URL = process.env.ASAAS_API_URL ?? 'https://api.asaas.com/v3'
const ASAAS_API_KEY = process.env.ASAAS_API_KEY ?? ''

/**
 * Headers padrão exigidos pela API do Asaas.
 * - access_token: autenticação
 * - User-Agent: obrigatório para contas criadas após 13/06/2024
 * - Content-Type: JSON
 */
export function headersAsaas(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'User-Agent': 'Hiskra-App/1.0 (Node.js; sandbox)',
    'access_token': ASAAS_API_KEY,
  }
}

export interface AsaasCustomerData {
  name: string
  email: string
  cpfCnpj?: string
  phone?: string
}

export interface AsaasCheckoutRequest {
  customer: string // id do customer já cadastrado no Asaas
  billingType: 'PIX' | 'BOLETO' | 'CREDIT_CARD'
  value: number
  dueDate: string // YYYY-MM-DD
  description?: string
  externalReference?: string
  redirectUrl?: string // URL para redirecionar após o pagamento
}

export interface AsaasCheckoutResponse {
  id: string
  url: string // URL do checkout Asaas para redirecionar o usuário
  status: string
  invoiceUrl?: string
}

export interface AsaasCheckoutSessionRequest {
  name: string
  email: string
  cpfCnpj?: string
  value: number
  dueDate: string
  description?: string
  externalReference?: string
  redirectUrl?: string
  billingType?: 'PIX' | 'BOLETO' | 'CREDIT_CARD'
}

export interface AsaasPaymentResult {
  id: string
  status: string
  billingType: string
  value: number
  invoiceUrl?: string
  bankSlipUrl?: string
  pixQrCode?: string
  pixCopiaECola?: string
  /** Usado para cartão: se o pagamento foi aprovado instantaneamente */
  confirmed?: boolean
}

export interface AsaasPixQrCodeData {
  encodedImage: string
  payload: string
  expirationDate: string
}

export interface AsaasWebhookEvent {
  event: string
  payment: {
    id: string
    externalReference: string
    status: string
    value: number
    billingType: string
    customer: string
  }
}

// ─── Clientes ───────────────────────────────────────────────

/**
 * Cria um cliente no Asaas (customer).
 * Deve ser chamado antes de criar o checkout.
 */
export async function criarClienteAsaas(
  data: AsaasCustomerData
): Promise<{ id: string } | null> {
  try {
    const response = await fetch(`${ASAAS_API_URL}/customers`, {
      method: 'POST',
      headers: headersAsaas(),
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        cpfCnpj: data.cpfCnpj ?? undefined,
        phone: data.phone ?? undefined,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`[Asaas] Erro ao criar cliente (${response.status}):`, errorBody)
      return null
    }

    const result = await response.json()
    return { id: result.id }
  } catch (error) {
    console.error('[Asaas] Erro na requisição ao criar cliente:', error)
    return null
  }
}

// ─── Checkout (Página Hospedada) ────────────────────────────

/**
 * Cria um pagamento/cobrança no Asaas e retorna a URL do checkout
 * para redirecionar o usuário.
 *
 * Estratégia:
 * 1. Cria um customer no Asaas (ou reusa se já existir)
 * 2. Cria um payment (cobrança) vinculado ao customer
 * 3. Retorna a URL do checkout Asaas para o usuário finalizar o pagamento
 */
export async function criarCheckoutAsaas(
  data: AsaasCheckoutRequest
): Promise<AsaasCheckoutResponse | null> {
  try {
    const response = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: headersAsaas(),
      body: JSON.stringify({
        customer: data.customer,
        billingType: data.billingType,
        value: data.value,
        dueDate: data.dueDate,
        description: data.description ?? '',
        externalReference: data.externalReference ?? '',
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`[Asaas] Erro ao criar checkout (${response.status}):`, errorBody)
      return null
    }

    const result = await response.json()

    // Usa a invoiceUrl retornada pela API (canônica) ou monta como fallback
    const baseCheckoutUrl = ASAAS_API_URL.includes('sandbox')
      ? 'https://sandbox.asaas.com'
      : 'https://asaas.com'
    const url = result.invoiceUrl ?? `${baseCheckoutUrl}/checkoutSession/show?id=${result.id}`

    return {
      id: result.id,
      url,
      status: result.status,
      invoiceUrl: result.invoiceUrl,
    }
  } catch (error) {
    console.error('[Asaas] Erro na requisição ao criar checkout:', error)
    return null
  }
}

/**
 * Cria uma sessão de checkout completa (customer + payment).
 * Retorna dados específicos conforme o método de pagamento escolhido.
 */
export async function criarCheckoutCompletoAsaas(
  data: AsaasCheckoutSessionRequest
): Promise<AsaasPaymentResult | null> {
  try {
    // 1. Cria o customer
    const customerResponse = await fetch(`${ASAAS_API_URL}/customers`, {
      method: 'POST',
      headers: headersAsaas(),
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        cpfCnpj: data.cpfCnpj ?? undefined,
      }),
    })

    if (!customerResponse.ok) {
      const errorBody = await customerResponse.text()
      console.error(`[Asaas] Erro ao criar customer (${customerResponse.status}):`, errorBody)
      return null
    }

    const customer = await customerResponse.json()

    // 2. Cria o pagamento
    const body: Record<string, unknown> = {
      customer: customer.id,
      billingType: data.billingType ?? 'PIX',
      value: data.value,
      dueDate: data.dueDate,
      description: data.description ?? '',
      externalReference: data.externalReference ?? '',
    }
    if (data.redirectUrl) {
      body.redirectUrl = data.redirectUrl
    }

    const paymentResponse = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: headersAsaas(),
      body: JSON.stringify(body),
    })

    if (!paymentResponse.ok) {
      const errorBody = await paymentResponse.text()
      console.error(`[Asaas] Erro ao criar pagamento (${paymentResponse.status}):`, errorBody)
      return null
    }

    const payment = await paymentResponse.json()

    const result: AsaasPaymentResult = {
      id: payment.id,
      status: payment.status,
      billingType: payment.billingType,
      value: payment.value,
      invoiceUrl: payment.invoiceUrl,
      bankSlipUrl: payment.bankSlipUrl,
      confirmed: payment.status === 'CONFIRMED' || payment.status === 'RECEIVED',
    }

    // Se for PIX, busca o QR Code
    if (data.billingType === 'PIX') {
      const pixData = await obterPixQrCode(payment.id)
      if (pixData) {
        result.pixQrCode = pixData.encodedImage
        result.pixCopiaECola = pixData.payload
      }
    }

    return result
  } catch (error) {
    console.error('[Asaas] Erro na requisição de checkout completo:', error)
    return null
  }
}

// ─── PIX QR Code ────────────────────────────────────────────

/**
 * Obtém o QR Code PIX de um pagamento já criado.
 * Chamado após criar um payment com billingType='PIX'.
 */
export async function obterPixQrCode(
  paymentId: string
): Promise<AsaasPixQrCodeData | null> {
  try {
    const response = await fetch(`${ASAAS_API_URL}/payments/${paymentId}/pixQrCode`, {
      headers: headersAsaas(),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`[Asaas] Erro ao obter PIX QR Code (${response.status}):`, errorBody)
      return null
    }

    const result = await response.json()
    return {
      encodedImage: result.encodedImage,
      payload: result.payload,
      expirationDate: result.expirationDate,
    }
  } catch (error) {
    console.error('[Asaas] Erro na requisição de PIX QR Code:', error)
    return null
  }
}

/**
 * Cria um pagamento de cartão de crédito usando token do Asaas.js.
 * Retorna o resultado do pagamento (pode ser aprovado instantaneamente).
 */
export async function criarPagamentoCartao(
  customerId: string,
  data: {
    creditCardToken: string
    value: number
    dueDate: string
    description?: string
    externalReference?: string
  }
): Promise<AsaasPaymentResult | null> {
  try {
    const response = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: headersAsaas(),
      body: JSON.stringify({
        customer: customerId,
        billingType: 'CREDIT_CARD',
        value: data.value,
        dueDate: data.dueDate,
        description: data.description ?? '',
        externalReference: data.externalReference ?? '',
        creditCardToken: data.creditCardToken,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`[Asaas] Erro ao pagar com cartão (${response.status}):`, errorBody)
      return null
    }

    const payment = await response.json()

    return {
      id: payment.id,
      status: payment.status,
      billingType: 'CREDIT_CARD',
      value: payment.value,
      invoiceUrl: payment.invoiceUrl,
      confirmed: payment.status === 'CONFIRMED' || payment.status === 'RECEIVED',
    }
  } catch (error) {
    console.error('[Asaas] Erro na requisição de pagamento cartão:', error)
    return null
  }
}

// ─── Webhook ─────────────────────────────────────────────────

/**
 * Resultado do processamento de um evento de webhook Asaas.
 */
export interface WebhookEventResult {
  /** ID do pagamento no Asaas (ex: pay_abc123) */
  asaasPaymentId: string
  /** ExternalReference enviado na criação do checkout */
  externalReference: string
  /** Status interno mapeado */
  status: 'aprovado' | 'pendente' | 'recusado' | 'estornado'
  /** Evento original do Asaas */
  event: string
  /** Valor do pagamento */
  value: number
  /** Método de pagamento */
  billingType: string
  /** ID do customer no Asaas */
  customerId: string
}

/**
 * Verifica a assinatura HMAC-SHA256 do webhook do Asaas.
 *
 * O Asaas envia o header `x-signature` com o hash HMAC-SHA256 do corpo da requisição.
 * A chave usada é a mesma ASAAS_API_KEY.
 *
 * @param body - Corpo bruto da requisição (string)
 * @param signature - Valor do header x-signature
 * @returns true se a assinatura for válida
 */
export function verificarAssinaturaWebhook(body: string, signature: string | null): boolean {
  if (!signature) {
    console.warn('[Asaas Webhook] Header x-signature ausente')
    return false
  }

  try {
    const hash = createHmac('sha256', ASAAS_API_KEY)
      .update(body)
      .digest('hex')

    // Timing-safe comparison para evitar timing attacks
    return timingSafeEqual(Buffer.from(hash), Buffer.from(signature))
  } catch (error) {
    console.error('[Asaas Webhook] Erro ao verificar assinatura:', error)
    return false
  }
}

/**
 * Processa um evento de webhook recebido do Asaas.
 * Retorna dados estruturados do evento para processamento.
 */
export function processarEventoWebhook(
  payload: AsaasWebhookEvent
): WebhookEventResult | null {
  const { event, payment } = payload

  // Mapeia eventos do Asaas para status internos
  const statusMap: Record<string, 'aprovado' | 'pendente' | 'recusado' | 'estornado'> = {
    PAYMENT_RECEIVED: 'aprovado',
    PAYMENT_CONFIRMED: 'aprovado',
    PAYMENT_CREATED: 'pendente',
    PAYMENT_PENDING: 'pendente',
    PAYMENT_OVERDUE: 'pendente',
    PAYMENT_REFUNDED: 'estornado',
    PAYMENT_REFUNDED_EXTERNAL: 'estornado',
    PAYMENT_CANCELLED: 'recusado',
    PAYMENT_DENIED: 'recusado',
    PAYMENT_FAILED: 'recusado',
  }

  const internalStatus = statusMap[event]
  if (!internalStatus) {
    console.warn(`[Asaas] Evento desconhecido ignorado: ${event}`)
    return null
  }

  return {
    asaasPaymentId: payment.id,
    externalReference: payment.externalReference,
    status: internalStatus,
    event,
    value: payment.value,
    billingType: payment.billingType,
    customerId: payment.customer,
  }
}
