'use client'

import { useFormStatus } from 'react-dom'
import { alternarStatusTesteAction } from '@/lib/admin-psich-actions'

function SubmitButton({ ativo }: { ativo: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
        ativo
          ? 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30'
          : 'text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
      } disabled:opacity-50`}
    >
      {pending ? '...' : ativo ? 'Desativar' : 'Ativar'}
    </button>
  )
}

export function AlternarStatusButton({ testeId, ativo }: { testeId: string; ativo: boolean }) {
  async function handleSubmit(formData: FormData) {
    await alternarStatusTesteAction(testeId, !ativo)
  }

  return (
    <form action={handleSubmit}>
      <SubmitButton ativo={ativo} />
    </form>
  )
}
