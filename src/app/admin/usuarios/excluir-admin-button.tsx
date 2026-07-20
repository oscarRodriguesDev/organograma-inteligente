'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { deletarAdminAction } from '@/lib/admin-actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Excluindo...' : 'Sim, excluir'}
    </button>
  )
}

export function ExcluirAdminButton({
  adminId,
  adminNome,
}: {
  adminId: string
  adminNome: string
}) {
  const [open, setOpen] = useState(false)
  const [erro, setErro] = useState('')

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-2.5 py-1.5 rounded-md border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
      >
        Excluir
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">Excluir Administrador</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Tem certeza que deseja excluir &ldquo;{adminNome}&rdquo;? Esta ação não pode ser desfeita.
            </p>

            {erro && <p className="text-sm text-red-500 mb-4">{erro}</p>}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <form
                action={async () => {
                  setErro('')
                  const res = await deletarAdminAction(adminId)
                  if (res.ok) {
                    setOpen(false)
                  } else {
                    setErro(res.erro ?? 'Erro ao excluir')
                  }
                }}
              >
                <SubmitButton />
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
