import { NextResponse } from 'next/server'
import {
  processarEventoWebhook,
  verificarAssinaturaWebhook,
} from '@/lib/asaas'
import { prisma } from '@/lib/prisma'
import type { AsaasWebhookEvent } from '@/lib/asaas'

/**
 * POST /api/webhooks/asaas
 *
 * Recebe notificações de eventos do Asaas (webhook) e:
 * 1. Verifica a assinatura HMAC (se o header x-signature estiver presente)
 * 2. Registra o evento no log de auditoria (WebhookLog)
 * 3. Mapeia o evento para status interno
 * 4. Cria ou atualiza o registro de Pagamento no banco
 * 5. Se o pagamento for CONFIRMADO/RECEBIDO, "libera o produto":
 *    - Atualiza a assinatura com a nova data de próximo pagamento
 *    - Garante que a empresa está ativa
 *
 * Eventos tratados:
 *   PAYMENT_RECEIVED / PAYMENT_CONFIRMED  → aprovado  → libera o produto
 *   PAYMENT_CREATED / PAYMENT_PENDING      → pendente
 *   PAYMENT_OVERDUE                        → pendente
 *   PAYMENT_REFUNDED / _EXTERNAL           → estornado  → revoga acesso
 *   PAYMENT_CANCELLED / DENIED / FAILED    → recusado
 */
export async function POST(request: Request) {
  const bodyRaw = await request.text()
  let payload: AsaasWebhookEvent

  try {
    payload = JSON.parse(bodyRaw)
  } catch {
    return new NextResponse('Payload inválido', { status: 400 })
  }

  const eventName = payload.event ?? 'unknown'
  console.log(`[Webhook Asaas] Evento recebido: ${eventName}`)

  // ─── 1. Verificação de assinatura (não bloqueante) ────────
  const signature = request.headers.get('x-signature')
  const assinaturaValida = verificarAssinaturaWebhook(bodyRaw, signature)
  if (!assinaturaValida && signature) {
    // Se o Asaas enviou um header mas a assinatura não confere, loga warning
    console.warn('[Webhook Asaas] Assinatura inválida! Possível fraude.')
    // Ainda processamos o evento (modo permissivo) — em produção você pode
    // optar por rejeitar requisições sem assinatura válida.
    // Descomente a linha abaixo para BLOQUEAR:
    // return new NextResponse('Assinatura inválida', { status: 401 })
  }

  // ─── 2. Processa o evento ──────────────────────────────────
  const evento = processarEventoWebhook(payload)
  if (!evento) {
    // Evento desconhecido ou não mapeado — retorna 200 para o Asaas não reenviar
    return new NextResponse('Evento ignorado', { status: 200 })
  }

  const {
    asaasPaymentId,
    externalReference,
    status: novoStatus,
    event,
    value,
    billingType,
  } = evento

  // Referências mock — ignora
  if (externalReference?.startsWith('MOCK-') || asaasPaymentId?.startsWith('mock-')) {
    return new NextResponse('OK', { status: 200 })
  }

  try {
    // ─── 3. Log do webhook (auditoria) ─────────────────────
    const webhookLog = await prisma.webhookLog.create({
      data: {
        evento: event,
        asaasPaymentId,
        externalReference: externalReference ?? '',
        status: novoStatus,
        payload: JSON.stringify(payload).slice(0, 4000), // limita tamanho
        processado: false,
      },
    })

    // ─── 4. Busca pagamento existente ───────────────────────
    let pagamento = await prisma.pagamento.findFirst({
      where: {
        OR: [
          { referenciaExterna: asaasPaymentId },
          { referenciaExterna: externalReference ?? '' },
        ],
      },
    })

    // ─── 5. Cria pagamento pendente se não existir ──────────
    if (!pagamento) {
      // O pagamento ainda não foi criado no nosso banco.
      // Isso acontece quando o webhook chega antes do usuário
      // completar o onboarding. Criamos um registro pendente
      // para que o onboarding possa vincular depois.
      pagamento = await prisma.pagamento.create({
        data: {
          assinaturaId: '', // será preenchido pelo onboarding
          valor: value,
          metodo: metodoInterno(billingType),
          status: novoStatus,
          referenciaExterna: asaasPaymentId,
        },
      })
      console.log(
        `[Webhook Asaas] Pagamento pendente criado: ${pagamento.id} (Asaas: ${asaasPaymentId})`
      )
    }

    // ─── 6. Atualiza status do pagamento ────────────────────
    await prisma.pagamento.update({
      where: { id: pagamento.id },
      data: { status: novoStatus },
    })

    // ─── 7. LIBERAÇÃO DO PRODUTO ────────────────────────────
    if (novoStatus === 'aprovado') {
      await liberarProduto(pagamento, asaasPaymentId, novoStatus)
    }

    // ─── 8. REVOGAÇÃO DE ACESSO ────────────────────────────
    if (novoStatus === 'estornado' || novoStatus === 'recusado') {
      await revogarAcesso(pagamento)
    }

    // Marca o log como processado
    await prisma.webhookLog.update({
      where: { id: webhookLog.id },
      data: { processado: true },
    })

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('[Webhook Asaas] Erro ao processar evento:', error)
    // Sempre retorna 200 para evitar reenvio do Asaas
    return new NextResponse('OK', { status: 200 })
  }
}

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Libera o produto quando o pagamento é confirmado:
 * - Atualiza a data de próximo pagamento da assinatura
 * - Garante que a empresa está ativa
 */
async function liberarProduto(
  pagamento: { id: string; assinaturaId: string | null },
  asaasPaymentId: string,
  status: string
) {
  if (!pagamento.assinaturaId) {
    // Ainda não vinculado a uma assinatura (onboarding pendente).
    // O vínculo será feito quando o usuário completar o cadastro.
    console.log(
      `[Webhook Asaas] Pagamento ${pagamento.id} aprovado, mas sem assinatura vinculada. ` +
      `Aguardando onboarding. Asaas ID: ${asaasPaymentId}`
    )
    return
  }

  // Busca a assinatura
  const assinatura = await prisma.assinatura.findUnique({
    where: { id: pagamento.assinaturaId },
    include: { empresa: true },
  })
  if (!assinatura) return

  // Atualiza a data de próximo pagamento
  const diasCiclo = assinatura.ciclo === 'anual' ? 365 : 30
  await prisma.assinatura.update({
    where: { id: assinatura.id },
    data: {
      status: 'ativa',
      dataProximoPagamento: new Date(Date.now() + diasCiclo * 24 * 60 * 60 * 1000),
    },
  })

  // Garante que a empresa está ativa
  if (assinatura.empresa && !assinatura.empresa.ativa) {
    await prisma.empresa.update({
      where: { id: assinatura.empresa.id },
      data: { ativa: true },
    })
    console.log(`[Webhook Asaas] Empresa ${assinatura.empresa.id} reativada`)
  }

  console.log(
    `[Webhook Asaas] Produto liberado! Pagamento ${pagamento.id}, ` +
    `Assinatura ${assinatura.id}, Empresa ${assinatura.empresa?.id ?? '?'}`
  )
}

/**
 * Revoga o acesso quando o pagamento é estornado/recusado:
 * - Marca a assinatura como cancelada/expirada
 * - Desativa a empresa (opcional, dependendo da gravidade)
 */
async function revogarAcesso(pagamento: { id: string; assinaturaId: string | null }) {
  if (!pagamento.assinaturaId) return

  const assinatura = await prisma.assinatura.findUnique({
    where: { id: pagamento.assinaturaId },
  })
  if (!assinatura) return

  // Se a assinatura estava ativa, marca como expirada
  if (assinatura.status === 'ativa') {
    await prisma.assinatura.update({
      where: { id: assinatura.id },
      data: { status: 'cancelada' },
    })
    console.log(`[Webhook Asaas] Assinatura ${assinatura.id} cancelada por estorno/recusa`)
  }
}

/**
 * Mapeia o billingType do Asaas para o método interno.
 */
function metodoInterno(billingType: string): string {
  const mapa: Record<string, string> = {
    PIX: 'pix',
    BOLETO: 'boleto',
    CREDIT_CARD: 'cartao_credito',
  }
  return mapa[billingType] ?? billingType.toLowerCase()
}
