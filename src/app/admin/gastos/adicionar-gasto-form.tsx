'use client'

import { useFormStatus } from 'react-dom'
import { criarGastoSistemaAction } from '@/lib/admin-actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2.5 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Salvando...' : 'Adicionar Gasto'}
    </button>
  )
}

export function AdicionarGastoForm({
  tipos,
  meses,
  anos,
}: {
  tipos: { value: string; label: string }[]
  meses: { value: number; label: string }[]
  anos: number[]
}) {
  const now = new Date()

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Novo Gasto</h2>
      <form action={criarGastoSistemaAction} className="space-y-4">
        {/* Tipo */}
        <div>
          <label htmlFor="tipo" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Tipo *
          </label>
          <select
            id="tipo"
            name="tipo"
            required
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
          >
            <option value="">Selecione...</option>
            {tipos.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

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
            placeholder="Ex: Servidor AWS mês"
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

        {/* Mês e Ano */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="mes" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              Mês *
            </label>
            <select
              id="mes"
              name="mes"
              required
              defaultValue={now.getMonth() + 1}
              className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
            >
              {meses.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ano" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              Ano *
            </label>
            <select
              id="ano"
              name="ano"
              required
              defaultValue={now.getFullYear()}
              className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
            >
              {anos.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Recorrente */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="recorrente"
            name="recorrente"
            className="rounded border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:ring-zinc-400"
          />
          <label htmlFor="recorrente" className="text-sm text-zinc-600 dark:text-zinc-400">
            Gasto recorrente
          </label>
        </div>

        {/* Fornecedor */}
        <div>
          <label htmlFor="fornecedor" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Fornecedor
          </label>
          <input
            type="text"
            id="fornecedor"
            name="fornecedor"
            placeholder="Nome do fornecedor"
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>

        {/* Observação */}
        <div>
          <label htmlFor="observacao" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Observação
          </label>
          <textarea
            id="observacao"
            name="observacao"
            rows={2}
            placeholder="Observações adicionais..."
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none"
          />
        </div>

        <SubmitButton />
      </form>
    </div>
  )
}
