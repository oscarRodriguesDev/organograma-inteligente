'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { processarPagamentoMock, criarCheckoutAsaasAction, finalizarPagamentoCartaoAction } from '@/lib/public-actions'

interface PlanoData {
  id: string
  nome: string
  slug: string
  descricao: string
  precoMensal: number
  precoAnual: number
  maxColaboradores: number
  recursos: string[]
  destaque: boolean
  descontoPercentual: number
  promocaoAtiva: boolean
  promocaoValidade: string | null
  promocaoDescricao: string
}

type MetodoPagamento = 'PIX' | 'BOLETO' | 'CREDIT_CARD'

type EstadoCheckout =
  | { tipo: 'form' }
  | { tipo: 'processando' }
  | { tipo: 'pix'; qrCode: string; copiaECola: string; pagamentoId: string; sessionToken: string }
  | { tipo: 'boleto'; url: string; pagamentoId: string; sessionToken: string }
  | { tipo: 'cartao_confirmado'; pagamentoId: string; sessionToken: string }
  | { tipo: 'sucesso' }
  | { tipo: 'erro'; mensagem: string }

export function CheckoutForm({ plano }: { plano: PlanoData }) {
  const router = useRouter()
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [ciclo, setCiclo] = useState<'mensal' | 'anual'>('mensal')
  const [metodo, setMetodo] = useState<MetodoPagamento>('PIX')
  const [estado, setEstado] = useState<EstadoCheckout>({ tipo: 'form' })

  const isMock = plano.slug === 'mock'

  function precoComDesconto(valor: number): number {
    if (plano.promocaoAtiva && plano.descontoPercentual > 0) {
      return valor * (1 - plano.descontoPercentual / 100)
    }
    return valor
  }

  const precoBase = ciclo === 'mensal' ? plano.precoMensal : plano.precoAnual
  const preco = precoComDesconto(precoBase)
  const temDesconto = preco !== precoBase

  const metodosDisponiveis: { value: MetodoPagamento; label: string; icon: string }[] = [
    { value: 'PIX', label: 'Pix', icon: '⚡' },
    { value: 'BOLETO', label: 'Boleto', icon: '📄' },
    { value: 'CREDIT_CARD', label: 'Cartão de Crédito', icon: '💳' },
  ]

  async function handlePixOuBoleto(formData: FormData) {
    setEstado({ tipo: 'processando' })
    const result = await criarCheckoutAsaasAction(formData)
    if (result.erro) {
      setEstado({ tipo: 'erro', mensagem: result.erro })
      return
    }
    if (!result.sessionToken) {
      setEstado({ tipo: 'erro', mensagem: 'Erro ao gerar sessão de pagamento' })
      return
    }

    if (metodo === 'PIX' && result.pixQrCode) {
      setEstado({
        tipo: 'pix',
        qrCode: result.pixQrCode,
        copiaECola: result.pixCopiaECola ?? '',
        pagamentoId: result.pagamentoId ?? '',
        sessionToken: result.sessionToken,
      })
    } else if (metodo === 'BOLETO' && result.boletoUrl) {
      setEstado({
        tipo: 'boleto',
        url: result.boletoUrl,
        pagamentoId: result.pagamentoId ?? '',
        sessionToken: result.sessionToken,
      })
    } else {
      setEstado({ tipo: 'erro', mensagem: 'Resposta inválida do servidor' })
    }
  }

  async function handleCartao(formData: FormData) {
    setEstado({ tipo: 'processando' })

    try {
      const token = await tokenizarCartaoViaAsaas(formData)
      if (!token) {
        setEstado({ tipo: 'erro', mensagem: 'Erro ao validar cartão. Verifique os dados.' })
        return
      }

      formData.set('creditCardToken', token)
      const result = await finalizarPagamentoCartaoAction(formData)

      if (result.erro) {
        setEstado({ tipo: 'erro', mensagem: result.erro })
        return
      }

      if (result.aprovado && result.sessionToken) {
        setEstado({ tipo: 'cartao_confirmado', pagamentoId: result.pagamentoId ?? '', sessionToken: result.sessionToken })
        setTimeout(() => {
          router.push(`/onboarding?sessionToken=${result.sessionToken}`)
        }, 1500)
      } else {
        setEstado({ tipo: 'erro', mensagem: 'Pagamento pendente ou recusado. Status: ' + (result.status ?? 'desconhecido') })
      }
    } catch {
      setEstado({ tipo: 'erro', mensagem: 'Erro ao processar cartão. Tente novamente.' })
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCarregando(true)
    setErro('')

    try {
      const formData = new FormData(e.currentTarget)
      formData.set('planoId', plano.id)
      formData.set('ciclo', ciclo)
      formData.set('metodo', metodo)

      if (isMock) {
        const result = await processarPagamentoMock(formData)
        if (result.success && result.sessionToken) {
          router.push(`/onboarding?sessionToken=${result.sessionToken}`)
        }
        return
      }

      if (metodo === 'CREDIT_CARD') {
        await handleCartao(formData)
      } else {
        await handlePixOuBoleto(formData)
      }
    } catch {
      setErro('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="flex-1 flex items-start justify-center p-8 pt-16">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-2">Finalizar Assinatura</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-8">
          Plano {plano.nome}
        </p>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
          <h2 className="font-semibold mb-3">Resumo do Plano</h2>
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-medium">{plano.nome}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{plano.descricao}</p>
            </div>
            <div className="text-right">
              {temDesconto ? (
                <>
                  <p className="text-sm text-zinc-400 line-through">R$ {precoBase.toFixed(2)}</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">R$ {preco.toFixed(2)}</p>
                  {plano.promocaoDescricao && (
                    <p className="text-[10px] text-green-600 dark:text-green-400">{plano.promocaoDescricao}</p>
                  )}
                </>
              ) : (
                <p className="text-2xl font-bold">R$ {preco.toFixed(2)}</p>
              )}
              <p className="text-xs text-zinc-400">/{ciclo === 'mensal' ? 'mês' : 'mês (anual)'}</p>
            </div>
          </div>
          <ul className="space-y-1.5">
            {plano.recursos.map((r, i) => (
              <li key={i} className="text-sm flex items-center gap-2">
                <span className="text-zinc-900 dark:text-zinc-100">✓</span>
                {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3 mb-8">
          <button
            type="button"
            onClick={() => { setCiclo('mensal'); setEstado({ tipo: 'form' }) }}
            className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              ciclo === 'mensal'
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-white dark:text-black'
                : 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900'
            }`}
          >
            Mensal
          </button>
          <button
            type="button"
            onClick={() => { setCiclo('anual'); setEstado({ tipo: 'form' }) }}
            className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              ciclo === 'anual'
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-white dark:text-black'
                : 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900'
            }`}
          >
            Anual
            <span className="ml-1 text-xs opacity-70">(-20%)</span>
          </button>
        </div>

        {estado.tipo === 'form' && (
          isMock || metodo !== 'CREDIT_CARD' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isMock ? (
                <>
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium text-center">
                    🧪 Modo de testes — pagamento 100% simulado
                  </p>
                  <div>
                    <label htmlFor="nomeCartao" className="mb-1 block text-sm font-medium">Nome no Cartão</label>
                    <input id="nomeCartao" name="nome" type="text" required defaultValue="Cliente Exemplo"
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-transparent focus:border-zinc-500 focus:outline-none" />
                  </div>
                  <div>
                    <label htmlFor="numeroCartao" className="mb-1 block text-sm font-medium">Número do Cartão</label>
                    <input id="numeroCartao" name="numeroCartao" type="text" required defaultValue="**** **** **** 4242" readOnly
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 text-zinc-500 cursor-not-allowed focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="validade" className="mb-1 block text-sm font-medium">Validade</label>
                      <input id="validade" name="validade" type="text" required defaultValue="12/28" readOnly
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 text-zinc-500 cursor-not-allowed focus:outline-none" />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="mb-1 block text-sm font-medium">CVV</label>
                      <input id="cvv" name="cvv" type="text" required defaultValue="123" readOnly
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 text-zinc-500 cursor-not-allowed focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Método de Pagamento</label>
                    <div className="flex gap-3">
                      {metodosDisponiveis.map((m) => (
                        <label key={m.value} className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 text-sm cursor-pointer has-[:checked]:border-zinc-900 has-[:checked]:bg-zinc-50 dark:has-[:checked]:border-zinc-100 dark:has-[:checked]:bg-zinc-900 transition-colors">
                          <input type="radio" name="metodoMock" value={m.value}
                            defaultChecked={m.value === 'PIX'} className="sr-only" />
                          {m.icon} {m.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Forma de Pagamento <span className="text-red-500">*</span></label>
                    <div className="flex gap-3">
                      {metodosDisponiveis.map((m) => (
                        <label key={m.value}
                          onClick={() => setMetodo(m.value)}
                          className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                            metodo === m.value
                              ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900'
                              : 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                          }`}
                        >
                          <input type="radio" name="metodo" value={m.value}
                            checked={metodo === m.value} onChange={() => {}}
                            className="sr-only" />
                          {m.icon} {m.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="nome" className="mb-1 block text-sm font-medium">Nome Completo <span className="text-red-500">*</span></label>
                    <input id="nome" name="nome" type="text" required
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-transparent focus:border-zinc-500 focus:outline-none"
                      placeholder="Seu nome completo" />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-medium">Email <span className="text-red-500">*</span></label>
                    <input id="email" name="email" type="email" required
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-transparent focus:border-zinc-500 focus:outline-none"
                      placeholder="seu@email.com" />
                  </div>
                  <div>
                    <label htmlFor="cpf" className="mb-1 block text-sm font-medium">CPF</label>
                    <input id="cpf" name="cpf" type="text"
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-transparent focus:border-zinc-500 focus:outline-none"
                      placeholder="000.000.000-00 (opcional)" />
                  </div>

                  <button
                    type="submit"
                    disabled={carregando}
                    className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
                  >
                    {carregando ? 'Processando...' : `Pagar R$ ${preco.toFixed(2)}`}
                  </button>
                </>
              )}

              <input type="hidden" name="planoId" value={plano.id} />
              <input type="hidden" name="ciclo" value={ciclo} />

              {erro && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {erro}
                </div>
              )}
            </form>
          ) : (
            <div className="space-y-4">
              <CartaoForm
                onSubmit={handleCartao}
                carregando={carregando}
                erro={erro}
                preco={preco}
                planoId={plano.id}
                ciclo={ciclo}
              />
            </div>
          )
        )}

        {estado.tipo === 'processando' && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin mb-4 dark:border-zinc-700 dark:border-t-zinc-100" />
            <p className="text-sm text-zinc-500">Processando pagamento...</p>
          </div>
        )}

            {estado.tipo === 'pix' && (
          <div className="text-center space-y-4">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="font-semibold mb-4">Pagamento via PIX</h3>
              <img
                src={`data:image/png;base64,${estado.qrCode}`}
                alt="QR Code PIX"
                className="mx-auto w-48 h-48 mb-4"
              />
              {estado.copiaECola && (
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3 text-left">
                  <p className="text-xs text-zinc-500 mb-1">Código PIX Copia e Cola:</p>
                  <p className="text-xs break-all font-mono select-all">{estado.copiaECola}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(estado.copiaECola)}
                    className="mt-2 text-xs text-blue-600 hover:underline"
                  >
                    Copiar código
                  </button>
                </div>
              )}
            </div>
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
              🧪 Ambiente Sandbox — pagamento não será processado de verdade.
            </div>
            <button
              onClick={() => router.push(`/onboarding?sessionToken=${estado.sessionToken}`)}
              className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
            >
              Simular pagamento e continuar
            </button>
            <button
              onClick={() => setEstado({ tipo: 'form' })}
              className="text-sm text-zinc-500 hover:underline"
            >
              Cancelar e voltar
            </button>
          </div>
        )}

        {estado.tipo === 'boleto' && (
          <div className="text-center space-y-4">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="font-semibold mb-2">Boleto Gerado</h3>
              <p className="text-sm text-zinc-500 mb-4">
                Seu boleto foi gerado. Clique no botão abaixo para visualizar e pagar.
              </p>
              <a
                href={estado.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
              >
                📄 Visualizar Boleto
              </a>
            </div>
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
              🧪 Ambiente Sandbox — pagamento não será processado de verdade.
            </div>
            <button
              onClick={() => router.push(`/onboarding?sessionToken=${estado.sessionToken}`)}
              className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
            >
              Simular pagamento e continuar
            </button>
            <button
              onClick={() => setEstado({ tipo: 'form' })}
              className="text-sm text-zinc-500 hover:underline"
            >
              Cancelar e voltar
            </button>
          </div>
        )}

        {estado.tipo === 'cartao_confirmado' && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="font-semibold mb-2">Pagamento Aprovado!</h3>
            <p className="text-sm text-zinc-500">Redirecionando para o cadastro...</p>
          </div>
        )}

        {estado.tipo === 'erro' && (
          <div className="text-center space-y-4">
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {estado.mensagem}
            </div>
            <button
              onClick={() => setEstado({ tipo: 'form' })}
              className="text-sm text-zinc-500 hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function CartaoForm({
  onSubmit,
  carregando,
  erro,
  preco,
  planoId,
  ciclo,
}: {
  onSubmit: (formData: FormData) => Promise<void>
  carregando: boolean
  erro: string
  preco: number
  planoId: string
  ciclo: string
}) {
  const [cartaoErro, setCartaoErro] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  async function handleCardSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCartaoErro('')

    const formData = new FormData(e.currentTarget)
    formData.set('planoId', planoId)
    formData.set('ciclo', ciclo)

    // Validações básicas antes de enviar
    const cardNumber = (formData.get('cardNumero')?.toString() ?? '').replace(/\s/g, '')
    const cardName = formData.get('nome')?.toString() ?? ''
    const cardValidade = formData.get('cardValidade')?.toString() ?? ''
    const cardCvv = formData.get('cardCvv')?.toString() ?? ''

    if (cardNumber.length < 13) {
      setCartaoErro('Número do cartão inválido')
      return
    }
    if (!cardName) {
      setCartaoErro('Nome no cartão é obrigatório')
      return
    }
    if (!cardValidade.match(/^\d{2}\/\d{2}$/)) {
      setCartaoErro('Validade inválida (use MM/AA)')
      return
    }
    if (cardCvv.length < 3) {
      setCartaoErro('CVV inválido')
      return
    }

    // Tokenização via Asaas.js
    const token = await tokenizarCartaoViaAsaas(formData)
    if (!token) {
      setCartaoErro('Erro ao validar cartão com a operadora')
      return
    }

    formData.set('creditCardToken', token)
    await onSubmit(formData)
  }

  return (
    <form ref={formRef} onSubmit={handleCardSubmit} className="space-y-4">
      <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
        🔒 Pagamento processado via <strong>Asaas</strong>
      </p>
      <div>
        <label htmlFor="cardNome" className="mb-1 block text-sm font-medium">Nome no Cartão <span className="text-red-500">*</span></label>
        <input id="cardNome" name="nome" type="text" required
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-transparent focus:border-zinc-500 focus:outline-none"
          placeholder="Nome como está no cartão" />
      </div>
      <div>
        <label htmlFor="cardNumero" className="mb-1 block text-sm font-medium">Número do Cartão <span className="text-red-500">*</span></label>
        <input id="cardNumero" name="cardNumero" type="text" inputMode="numeric" required autoComplete="cc-number"
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-transparent focus:border-zinc-500 focus:outline-none"
          placeholder="0000 0000 0000 0000" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="cardValidade" className="mb-1 block text-sm font-medium">Validade <span className="text-red-500">*</span></label>
          <input id="cardValidade" name="cardValidade" type="text" required placeholder="MM/AA"
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-transparent focus:border-zinc-500 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="cardCvv" className="mb-1 block text-sm font-medium">CVV <span className="text-red-500">*</span></label>
          <input id="cardCvv" name="cardCvv" type="text" inputMode="numeric" required autoComplete="cc-csc"
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-transparent focus:border-zinc-500 focus:outline-none"
            placeholder="123" />
        </div>
      </div>
      <div>
        <label htmlFor="cardEmail" className="mb-1 block text-sm font-medium">Email <span className="text-red-500">*</span></label>
        <input id="cardEmail" name="email" type="email" required
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-transparent focus:border-zinc-500 focus:outline-none"
          placeholder="seu@email.com" />
      </div>
      <div>
        <label htmlFor="cardCpf" className="mb-1 block text-sm font-medium">CPF do Titular</label>
        <input id="cardCpf" name="cpf" type="text"
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-transparent focus:border-zinc-500 focus:outline-none"
          placeholder="000.000.000-00" />
      </div>
      {(cartaoErro || erro) && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {cartaoErro || erro}
        </div>
      )}
      <button
        type="submit"
        disabled={carregando}
        className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
      >
        {carregando ? 'Processando...' : `Pagar R$ ${preco.toFixed(2)}`}
      </button>
      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-4 py-3 text-sm text-blue-700 dark:text-blue-400">
        🔒 Pagamento processado via <strong>Asaas</strong> — dados protegidos.
      </div>
      <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
        🧪 Ambiente Sandbox — use cartão de teste: <strong>5162 3062 1937 8829</strong> (qualquer validade/CVV)
      </div>
    </form>
  )
}

declare global {
  interface Window {
    AsaasCreditCard?: {
      callAsaasSdk: (params: {
        creditCard: {
          creditCardNumber: string
          creditCardBrand?: string
          creditCardHolderName: string
          creditCardExpirationMonth: string
          creditCardExpirationYear: string
          creditCardCvv: string
        }
        onSuccess: (response: { creditCardToken: string }) => void
        onError: (error: { errors?: Array<{ description: string }> }) => void
      }) => void
    }
  }
}

let asaasJsLoaded = false
let asaasJsLoading: Promise<void> | null = null

function carregarAsaasJs(): Promise<void> {
  if (asaasJsLoaded) return Promise.resolve()
  if (asaasJsLoading) return asaasJsLoading

  asaasJsLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.asaas.com/asaas.js'
    script.async = true
    script.onload = () => {
      asaasJsLoaded = true
      resolve()
    }
    script.onerror = () => {
      asaasJsLoaded = false
      asaasJsLoading = null
      reject(new Error('Falha ao carregar Asaas.js'))
    }
    document.head.appendChild(script)
  })

  return asaasJsLoading
}

function detectCardBrand(numero: string): string {
  const n = numero.replace(/\s/g, '')
  if (/^4/.test(n)) return 'VISA'
  if (/^5[1-5]/.test(n)) return 'MASTERCARD'
  if (/^3[47]/.test(n)) return 'AMEX'
  if (/^6(?:011|5)/.test(n)) return 'DISCOVER'
  if (/^30[0-5]|^36|^38/.test(n)) return 'DINERS'
  if (/^50|^60/.test(n)) return 'HIPERCARD'
  if (/^40/.test(n)) return 'VISA'
  return 'UNKNOWN'
}

async function tokenizarCartaoViaAsaas(formData: FormData): Promise<string | null> {
  try {
    await carregarAsaasJs()

    if (!window.AsaasCreditCard) {
      console.error('[Checkout] Asaas.js não disponível')
      return null
    }

    return new Promise((resolve) => {
      const numero = (formData.get('cardNumero')?.toString() ?? '').replace(/\s/g, '')
      const nome = formData.get('nome')?.toString() ?? ''
      const validade = formData.get('cardValidade')?.toString() ?? ''
      const cvv = formData.get('cardCvv')?.toString() ?? ''
      const [mes, ano] = validade.split('/')
      const brand = detectCardBrand(numero)

      window.AsaasCreditCard!.callAsaasSdk({
        creditCard: {
          creditCardNumber: numero,
          creditCardBrand: brand,
          creditCardHolderName: nome,
          creditCardExpirationMonth: mes,
          creditCardExpirationYear: '20' + ano,
          creditCardCvv: cvv,
        },
        onSuccess: (response) => resolve(response.creditCardToken),
        onError: () => resolve(null),
      })
    })
  } catch (error) {
    console.error('[Checkout] Erro tokenizar cartão:', error)
    return null
  }
}
