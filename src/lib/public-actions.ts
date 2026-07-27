'use server'

import { config } from 'dotenv'
// Garante que as variáveis do .env sobrescrevam qualquer valor pré-existente
config({ override: true })

import { criarEmpresaComCEO } from './db'
import { redirect } from 'next/navigation'
import { prisma } from './prisma'
import { criarCheckoutCompletoAsaas, criarPagamentoCartao, headersAsaas } from './asaas'
import { gerarSessionToken, verificarSessionToken } from './payment-session'

/**
 * Processa o pagamento conforme o tipo de plano.
 *
 * Para o plano "mock" (slug: "mock"), simula o pagamento localmente.
 * Para planos reais, o checkout é processado via API Asaas diretamente
 * (sem passar pelo Route Handler /api/checkout).
 */
export async function processarPagamentoMock(formData: FormData) {
  await new Promise((r) => setTimeout(r, 2000))

  const planoId = formData.get('planoId')?.toString() ?? ''
  const ciclo = formData.get('ciclo')?.toString() ?? 'mensal'

  const sessionToken = await gerarSessionToken({
    pagamentoId: `mock-${Date.now()}`,
    planoId,
    ciclo,
    metodo: 'mock',
  })

  return { success: true, metodo: 'mock', sessionToken }
}

/**
 * Cria um pagamento no Asaas com PIX ou Boleto (fluxo transparente).
 * Para cartão, use finalizarPagamentoCartaoAction.
 *
 * Retorna os dados para exibir o pagamento na própria página.
 */
export async function criarCheckoutAsaasAction(formData: FormData): Promise<{
  pagamentoId?: string
  sessionToken?: string
  metodo?: string
  pixQrCode?: string
  pixCopiaECola?: string
  boletoUrl?: string
  valor?: number
  status?: string
  erro?: string
}> {
  const planoId = formData.get('planoId')?.toString() ?? ''
  const ciclo = formData.get('ciclo')?.toString() ?? 'mensal'
  const metodo = formData.get('metodo')?.toString() ?? 'PIX'
  const customerName = formData.get('nome')?.toString() ?? ''
  const customerEmail = formData.get('email')?.toString() ?? ''
  const customerCpf = formData.get('cpf')?.toString()

  if (!planoId || !customerName || !customerEmail) {
    return { erro: 'Campos obrigatórios não preenchidos' }
  }

  try {
    const plano = await prisma.plano.findUnique({ where: { id: planoId } })
    if (!plano) return { erro: 'Plano não encontrado' }

    let valor = ciclo === 'anual' ? plano.precoAnual : plano.precoMensal
    if (plano.promocaoAtiva && plano.descontoPercentual > 0) {
      valor = valor * (1 - plano.descontoPercentual / 100)
    }
    if (!valor || valor <= 0) return { erro: 'Valor do plano inválido' }

    const isMock =
      !process.env.ASAAS_API_KEY ||
      process.env.ASAAS_API_KEY === 'mock_key_para_testes'

    if (isMock) {
      return { erro: 'Modo mock não suporta pagamento transparente' }
    }

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 1)
    const dueDateStr = dueDate.toISOString().split('T')[0]

    if (metodo === 'CREDIT_CARD') {
      return { erro: 'Use finalizarPagamentoCartaoAction para cartão' }
    }

    const billingType = metodo as 'PIX' | 'BOLETO'

    const resultado = await criarCheckoutCompletoAsaas({
      name: customerName,
      email: customerEmail,
      cpfCnpj: customerCpf,
      value: valor,
      dueDate: dueDateStr,
      description: `Assinatura ${plano.nome} - ${ciclo === 'anual' ? 'Anual' : 'Mensal'}${plano.promocaoAtiva ? ` (${plano.descontoPercentual}% OFF)` : ''}`,
      externalReference: `PLANO:${planoId}:CICLO:${ciclo}:TS:${Date.now()}`,
      billingType,
    })

    if (!resultado) {
      return { erro: 'Erro ao processar pagamento. Verifique o console do servidor.' }
    }

    const sessionToken = await gerarSessionToken({
      pagamentoId: resultado.id,
      planoId,
      ciclo,
      metodo: billingType,
    })

    return {
      pagamentoId: resultado.id,
      sessionToken,
      metodo: resultado.billingType,
      pixQrCode: resultado.pixQrCode,
      pixCopiaECola: resultado.pixCopiaECola,
      boletoUrl: resultado.bankSlipUrl,
      valor: resultado.value,
      status: resultado.status,
    }
  } catch (error) {
    console.error('[criarCheckoutAsaasAction] Erro:', error)
    return { erro: `Erro ao processar pagamento: ${error instanceof Error ? error.message : 'Erro de conexão'}` }
  }
}

/**
 * Finaliza o pagamento com cartão de crédito usando token do Asaas.js.
 * Chamado APÓS tokenizar o cartão no frontend.
 */
export async function finalizarPagamentoCartaoAction(formData: FormData): Promise<{
  pagamentoId?: string
  sessionToken?: string
  status?: string
  aprovado?: boolean
  erro?: string
}> {
  const planoId = formData.get('planoId')?.toString() ?? ''
  const ciclo = formData.get('ciclo')?.toString() ?? 'mensal'
  const customerName = formData.get('nome')?.toString() ?? ''
  const customerEmail = formData.get('email')?.toString() ?? ''
  const customerCpf = formData.get('cpf')?.toString()
  const creditCardToken = formData.get('creditCardToken')?.toString() ?? ''

  if (!planoId || !customerName || !customerEmail || !creditCardToken) {
    return { erro: 'Campos obrigatórios não preenchidos' }
  }

  // Valida o formato do token (evita tokens falsos/fabricados)
  if (!creditCardToken.startsWith('tok_') || creditCardToken.length < 20) {
    return { erro: 'Token de cartão inválido' }
  }

  try {
    const plano = await prisma.plano.findUnique({ where: { id: planoId } })
    if (!plano) return { erro: 'Plano não encontrado' }

    let valor = ciclo === 'anual' ? plano.precoAnual : plano.precoMensal
    if (plano.promocaoAtiva && plano.descontoPercentual > 0) {
      valor = valor * (1 - plano.descontoPercentual / 100)
    }
    if (!valor || valor <= 0) return { erro: 'Valor do plano inválido' }

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 1)
    const dueDateStr = dueDate.toISOString().split('T')[0]

    // Cria o customer no Asaas
    const customerResponse = await fetch(`${process.env.ASAAS_API_URL}/customers`, {
      method: 'POST',
      headers: headersAsaas(),
      body: JSON.stringify({
        name: customerName,
        email: customerEmail,
        cpfCnpj: customerCpf ?? undefined,
      }),
    })

    if (!customerResponse.ok) {
      const err = await customerResponse.text()
      console.error('[Cartão] Erro ao criar customer:', err)
      return { erro: 'Erro ao processar pagamento' }
    }

    const customer = await customerResponse.json()

    // Cria o pagamento com cartão
    const pagamento = await criarPagamentoCartao(customer.id, {
      creditCardToken,
      value: valor,
      dueDate: dueDateStr,
      description: `Assinatura ${plano.nome} - ${ciclo === 'anual' ? 'Anual' : 'Mensal'}${plano.promocaoAtiva ? ` (${plano.descontoPercentual}% OFF)` : ''}`,
      externalReference: `PLANO:${planoId}:CICLO:${ciclo}:TS:${Date.now()}`,
    })

    if (!pagamento) {
      return { erro: 'Cartão recusado ou erro no processamento' }
    }

    const sessionToken = await gerarSessionToken({
      pagamentoId: pagamento.id,
      planoId,
      ciclo,
      metodo: 'CREDIT_CARD',
    })

    return {
      pagamentoId: pagamento.id,
      sessionToken,
      status: pagamento.status,
      aprovado: pagamento.confirmed,
    }
  } catch (error) {
    console.error('[finalizarPagamentoCartaoAction] Erro:', error)
    return { erro: `Erro ao processar pagamento: ${error instanceof Error ? error.message : 'Erro de conexão'}` }
  }
}

export async function criarContaAction(formData: FormData) {
  const nome = formData.get('nome')?.toString() ?? ''
  const slug = formData.get('slug')?.toString() ?? ''
  const cnpj = formData.get('cnpj')?.toString() ?? ''
  const contatoNome = formData.get('contatoNome')?.toString() ?? ''
  const contatoEmail = formData.get('contatoEmail')?.toString() ?? ''
  const ceoNome = formData.get('ceoNome')?.toString() ?? ''
  const ceoEmail = formData.get('ceoEmail')?.toString() ?? ''
  const ceoSenha = formData.get('ceoSenha')?.toString() ?? ''
  const sessionToken = formData.get('sessionToken')?.toString() ?? ''

  if (!sessionToken) {
    throw new Error('Sessão de pagamento inválida. Faça o checkout novamente.')
  }

  // Verifica o token de sessão (criptograficamente assinado)
  const session = await verificarSessionToken(sessionToken)
  if (!session) {
    throw new Error('Sessão expirada ou inválida. Faça o checkout novamente.')
  }

  const { planoId, ciclo, pagamentoId, metodo } = session

  if (!nome || !slug || !ceoNome || !ceoEmail || !ceoSenha || !planoId) {
    throw new Error('Campos obrigatórios não preenchidos')
  }

  // Para pagamento real (não mock), verifica se o webhook já confirmou
  if (pagamentoId && !pagamentoId.startsWith('mock-')) {
    const pagamento = await prisma.pagamento.findFirst({
      where: {
        OR: [
          { referenciaExterna: pagamentoId },
          { id: pagamentoId },
        ],
      },
    })

    if (pagamento && pagamento.status === 'pendente') {
      throw new Error(
        'Pagamento ainda não foi confirmado. O PIX pode levar alguns segundos para ser aprovado. ' +
        'Se já pagou, aguarde e tente novamente.'
      )
    }
  }

  await criarEmpresaComCEO({
    nome,
    slug,
    cnpj,
    contatoNome,
    contatoEmail,
    ceoNome,
    ceoEmail,
    ceoSenha,
    planoId,
    ciclo,
    pagamentoId,
    metodo: metodo ?? (pagamentoId?.startsWith('mock-') ? 'cartao_credito' : undefined),
  })

  redirect('/login?sucesso=1')
}
