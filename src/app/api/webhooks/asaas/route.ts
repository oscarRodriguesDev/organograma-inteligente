import { NextResponse } from 'next/server'
import { processarEventoWebhook } from '@/lib/asaas'
import { prisma } from '@/lib/prisma'
import type { AsaasWebhookEvent } from '@/lib/asaas'

/**
 * POST /api/webhooks/asaas
 *
 * Recebe notificações de eventos do Asaas (webhook).
 * Atualiza o status do pagamento no banco de dados conforme o evento.
 *
 * Eventos tratados:
 * - PAYMENT_RECEIVED / PAYMENT_CONFIRMED → aprovado
 * - PAYMENT_CREATED / PAYMENT_PENDING / PAYMENT_OVERDUE → pendente
 * - PAYMENT_REFUNDED / PAYMENT_REFUNDED_EXTERNAL → estornado
 * - PAYMENT_CANCELLED / PAYMENT_DENIED / PAYMENT_FAILED → recusado
 */
export async function POST(request: Request) {
  try {
    const payload: AsaasWebhookEvent = await request.json()

    console.log('[Webhook Asaas] Evento recebido:', payload.event)

    // Processa o evento
    const evento = processarEventoWebhook(payload)
    if (!evento) {
      // Evento desconhecido ou não mapeado — retorna 200 para o Asaas não reenviar
      return new NextResponse('Evento ignorado', { status: 200 })
    }

    const { externalReference, status } = evento

    // Referências mock — ignora
    if (!externalReference || externalReference.startsWith('MOCK-')) {
      return new NextResponse('OK', { status: 200 })
    }

    // Tenta encontrar um pagamento com esta referência externa
    const pagamentoExistente = await prisma.pagamento.findFirst({
      where: { referenciaExterna: externalReference },
    })

    if (pagamentoExistente) {
      // Atualiza o status do pagamento existente
      await prisma.pagamento.update({
        where: { id: pagamentoExistente.id },
        data: { status },
      })

      // Se o pagamento foi aprovado, atualiza a data de próximo pagamento da assinatura
      if (status === 'aprovado') {
        const assinatura = await prisma.assinatura.findUnique({
          where: { id: pagamentoExistente.assinaturaId },
        })
        if (assinatura) {
          const diasCiclo = assinatura.ciclo === 'anual' ? 365 : 30
          await prisma.assinatura.update({
            where: { id: assinatura.id },
            data: {
              dataProximoPagamento: new Date(Date.now() + diasCiclo * 24 * 60 * 60 * 1000),
            },
          })
        }
      }

      console.log(`[Webhook Asaas] Pagamento ${pagamentoExistente.id} atualizado para ${status}`)
    } else {
      // Pagamento ainda não existe no nosso banco.
      // Isso ocorre quando o webhook chega antes do usuário completar o onboarding.
      // O pagamento será criado quando a empresa for registrada.
      console.log(
        `[Webhook Asaas] Pagamento com ref "${externalReference}" ainda não cadastrado. ` +
        `Status: ${status}. Aguardando onboarding.`
      )
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('[Webhook Asaas] Erro ao processar evento:', error)
    return new NextResponse('Erro interno', { status: 500 })
  }
}
