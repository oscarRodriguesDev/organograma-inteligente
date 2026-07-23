import { NextResponse } from 'next/server'
import { criarCheckoutCompletoAsaas } from '@/lib/asaas'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/checkout
 *
 * Cria uma sessão de checkout no Asaas para um plano real.
 *
 * Body esperado:
 * {
 *   planoId: string
 *   ciclo: 'mensal' | 'anual'
 *   customerName: string
 *   customerEmail: string
 *   customerCpf?: string
 * }
 *
 * Retorna:
 * { url: string } — URL do checkout Asaas para redirecionar o usuário
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { planoId, ciclo, customerName, customerEmail, customerCpf } = body

    if (!planoId || !ciclo || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: planoId, ciclo, customerName, customerEmail' },
        { status: 400 }
      )
    }

    // Busca o plano no banco
    const plano = await prisma.plano.findUnique({ where: { id: planoId } })
    if (!plano) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 })
    }

    // Calcula o valor conforme o ciclo
    let valor = ciclo === 'anual' ? plano.precoAnual : plano.precoMensal

    // Aplica desconto promocional se ativo
    if (plano.promocaoAtiva && plano.descontoPercentual > 0) {
      valor = valor * (1 - plano.descontoPercentual / 100)
    }

    if (!valor || valor <= 0) {
      return NextResponse.json({ error: 'Valor do plano inválido' }, { status: 400 })
    }

    // ─── App URL para callback ─────────────────────────────
    const appUrl = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'

    // ─── Verifica se é modo mock ───────────────────────────
    const isMock = !process.env.ASAAS_API_KEY || process.env.ASAAS_API_KEY === 'mock_key_para_testes'
    if (isMock) {
      // Modo mock: retorna URL simulada que redireciona direto para o onboarding
      return NextResponse.json({
        url: `${appUrl}/onboarding?planoId=${planoId}&ciclo=${ciclo}`,
        checkoutId: `mock-${Date.now()}`,
      })
    }

    // ─── Fluxo real Asaas ───────────────────────────────────

    // Gera data de vencimento (amanhã)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 1)
    const dueDateStr = dueDate.toISOString().split('T')[0]

    // URL para redirecionar após o pagamento
    const redirectUrl = `${appUrl}/onboarding?planoId=${planoId}&ciclo=${ciclo}`

    // Cria o checkout completo (customer + payment) no Asaas
    const checkout = await criarCheckoutCompletoAsaas({
      name: customerName,
      email: customerEmail,
      cpfCnpj: customerCpf,
      value: valor,
      dueDate: dueDateStr,
      description: `Assinatura ${plano.nome} - ${ciclo === 'anual' ? 'Anual' : 'Mensal'}${plano.promocaoAtiva ? ` (${plano.descontoPercentual}% OFF)` : ''}`,
      externalReference: `PLANO:${planoId}:CICLO:${ciclo}:TS:${Date.now()}`,
      billingType: 'PIX',
      redirectUrl,
    })

    if (!checkout) {
      return NextResponse.json(
        { error: 'Erro ao criar checkout no Asaas. Verifique as credenciais.' },
        { status: 502 }
      )
    }

    // Retorna os dados do pagamento
    return NextResponse.json({
      id: checkout.id,
      status: checkout.status,
      billingType: checkout.billingType,
      invoiceUrl: checkout.invoiceUrl,
      bankSlipUrl: checkout.bankSlipUrl,
      pixQrCode: checkout.pixQrCode,
      pixCopiaECola: checkout.pixCopiaECola,
    })
  } catch (error) {
    console.error('[Checkout API] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno ao processar checkout' },
      { status: 500 }
    )
  }
}
