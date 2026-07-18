'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { atualizarGastoSistemaAction } from '@/lib/admin-actions'
import type { GastoSistema } from '@/lib/types'

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

export function EditarGastoForm({
  gasto,
  tipos,
  meses,
  anos,
}: {
  gasto: GastoSistema
  tipos: { value: string; label: string }[]
  meses: { value: number; label: string }[]
  anos: number[]
}) {
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
              <h3 className="text-lg font-semibold text-foreground">Editar Gasto</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                await atualizarGastoSistemaAction(gasto.id, formData)
                setOpen(false)
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="edit-tipo" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Tipo
                </label>
                <select
                  id="edit-tipo"
                  name="tipo"
                  defaultValue={gasto.tipo}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
                >
                  {tipos.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edit-descricao" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  id="edit-descricao"
                  name="descricao"
                  defaultValue={gasto.descricao}
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
                  defaultValue={gasto.valor}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-mes" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Mês
                  </label>
                  <select
                    id="edit-mes"
                    name="mes"
                    defaultValue={gasto.mes}
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
                  <label htmlFor="edit-ano" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Ano
                  </label>
                  <select
                    id="edit-ano"
                    name="ano"
                    defaultValue={gasto.ano}
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-recorrente"
                  name="recorrente"
                  defaultChecked={gasto.recorrente}
                  className="rounded border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:ring-zinc-400"
                />
                <label htmlFor="edit-recorrente" className="text-sm text-zinc-600 dark:text-zinc-400">
                  Gasto recorrente
                </label>
              </div>

              <div>
                <label htmlFor="edit-fornecedor" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Fornecedor
                </label>
                <input
                  type="text"
                  id="edit-fornecedor"
                  name="fornecedor"
                  defaultValue={gasto.fornecedor}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>

              <div>
                <label htmlFor="edit-observacao" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Observação
                </label>
                <textarea
                  id="edit-observacao"
                  name="observacao"
                  rows={2}
                  defaultValue={gasto.observacao}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none"
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
