'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { removerTesteAction } from '@/lib/admin-psich-actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 transition-colors"
    >
      {pending ? '...' : 'Excluir'}
    </button>
  )
}

export function ExcluirTesteButton({ testeId, testeNome }: { testeId: string; testeNome: string }) {
  const [confirmando, setConfirmando] = useState(false)

  async function handleSubmit(formData: FormData) {
    const res = await removerTesteAction(testeId)
    if (!res.ok) {
      alert(res.erro ?? 'Erro ao excluir')
    }
    setConfirmando(false)
  }

  if (confirmando) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-500">Confirmar?</span>
        <form action={handleSubmit}>
          <SubmitButton />
        </form>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="px-3 py-1.5 text-xs font-medium text-zinc-500 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirmando(true)}
      className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
    >
      Excluir
    </button>
  )
}
