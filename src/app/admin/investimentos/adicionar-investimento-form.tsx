'use client'

import { useFormStatus } from 'react-dom'
import { criarInvestimentoAction } from '@/lib/admin-actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2.5 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Salvando...' : 'Adicionar Investimento'}
    </button>
  )
}

export function AdicionarInvestimentoForm() {
  return (
    <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Novo Investimento</h2>
      <form action={criarInvestimentoAction} className="space-y-4">
        {/* Descrição */}
        <div>
          <label htmlFor="descricao" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Descrição *
          </label>
          <input
            type="text"
            id="descricao"
            name="descricao"
            required
            placeholder="Ex: Investimento inicial plataforma"
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>

        {/* Valor */}
        <div>
          <label htmlFor="valor" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Valor *
          </label>
          <input
            type="number"
            id="valor"
            name="valor"
            required
            step="0.01"
            min="0.01"
            placeholder="0,00"
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>

        {/* Data */}
        <div>
          <label htmlFor="data" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Data do Investimento *
          </label>
          <input
            type="date"
            id="data"
            name="data"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>

        <SubmitButton />
      </form>
    </div>
  )
}
