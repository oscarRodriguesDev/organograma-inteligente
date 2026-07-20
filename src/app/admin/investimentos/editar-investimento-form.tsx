'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { atualizarInvestimentoAction } from '@/lib/admin-actions'
import type { Investimento } from '@/lib/types'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Salvando...' : 'Salvar'}
    </button>
  )
}

export function EditarInvestimentoForm({ investimento }: { investimento: Investimento }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-2.5 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        Editar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-md w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Editar Investimento</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                await atualizarInvestimentoAction(investimento.id, formData)
                setOpen(false)
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="edit-descricao" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  id="edit-descricao"
                  name="descricao"
                  defaultValue={investimento.descricao}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>

              <div>
                <label htmlFor="edit-valor" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Valor
                </label>
                <input
                  type="number"
                  id="edit-valor"
                  name="valor"
                  step="0.01"
                  defaultValue={investimento.valor}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>

              <div>
                <label htmlFor="edit-data" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Data do Investimento
                </label>
                <input
                  type="date"
                  id="edit-data"
                  name="data"
                  defaultValue={investimento.data.slice(0, 10)}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <SubmitButton />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
