'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { processarPagamentoMock } from '@/lib/public-actions'

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
}

export function CheckoutForm({ plano }: { plano: PlanoData }) {
  const router = useRouter()
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [ciclo, setCiclo] = useState<'mensal' | 'anual'>('mensal')

  const preco = ciclo === 'mensal' ? plano.precoMensal : plano.precoAnual

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCarregando(true)
    setErro('')

    try {
      const formData = new FormData(e.currentTarget)
      const result = await processarPagamentoMock(formData)

      if (result.success) {
        router.push(`/onboarding?planoId=${plano.id}&ciclo=${ciclo}`)
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

        {/* Resumo do plano */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
          <h2 className="font-semibold mb-3">Resumo do Plano</h2>
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-medium">{plano.nome}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{plano.descricao}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">R$ {preco.toFixed(2)}</p>
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

        {/* Seletor de ciclo */}
        <div className="flex gap-3 mb-8">
          <button
            type="button"
            onClick={() => setCiclo('mensal')}
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
            onClick={() => setCiclo('anual')}
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

        {/* Formulário mockado */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nomeCartao" className="mb-1 block text-sm font-medium">
              Nome no Cartão
            </label>
            <input
              id="nomeCartao"
              name="nomeCartao"
              type="text"
              required
              defaultValue="Cliente Exemplo"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-transparent focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="numeroCartao" className="mb-1 block text-sm font-medium">
              Número do Cartão
            </label>
            <input
              id="numeroCartao"
              name="numeroCartao"
              type="text"
              required
              defaultValue="**** **** **** 4242"
              readOnly
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 text-zinc-500 cursor-not-allowed focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="validade" className="mb-1 block text-sm font-medium">
                Validade
              </label>
              <input
                id="validade"
                name="validade"
                type="text"
                required
                defaultValue="12/28"
                readOnly
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 text-zinc-500 cursor-not-allowed focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="cvv" className="mb-1 block text-sm font-medium">
                CVV
              </label>
              <input
                id="cvv"
                name="cvv"
                type="text"
                required
                defaultValue="123"
                readOnly
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 text-zinc-500 cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Método de Pagamento</label>
            <div className="flex gap-3">
              {[
                { value: 'cartao_credito', label: '💳 Crédito' },
                { value: 'boleto', label: '📄 Boleto' },
                { value: 'pix', label: '⚡ Pix' },
              ].map((metodo) => (
                <label
                  key={metodo.value}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 text-sm cursor-pointer has-[:checked]:border-zinc-900 has-[:checked]:bg-zinc-50 dark:has-[:checked]:border-zinc-100 dark:has-[:checked]:bg-zinc-900 transition-colors"
                >
                  <input
                    type="radio"
                    name="metodo"
                    value={metodo.value}
                    defaultChecked={metodo.value === 'cartao_credito'}
                    className="sr-only"
                  />
                  {metodo.label}
                </label>
              ))}
            </div>
          </div>

          <input type="hidden" name="planoId" value={plano.id} />
          <input type="hidden" name="ciclo" value={ciclo} />

          {erro && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
          >
            {carregando ? 'Processando...' : `Finalizar Pagamento - R$ ${preco.toFixed(2)}`}
          </button>

          <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
            Pagamento 100% simulado. Nenhum valor real será cobrado.
          </p>
        </form>
      </div>
    </div>
  )
}
