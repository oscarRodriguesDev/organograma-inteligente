'use client'

import { useFormStatus } from 'react-dom'
import { alternarStatusEmpresaAction } from '@/lib/admin-actions'

function SubmitButton({ ativa }: { ativa: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
        ativa
          ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/50'
          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50'
      } disabled:opacity-50`}
    >
      {pending ? '...' : ativa ? 'Desativar' : 'Ativar'}
    </button>
  )
}

export function AlternarStatusEmpresaButton({
  empresaId,
  ativa,
}: {
  empresaId: string
  ativa: boolean
}) {
  return (
    <form action={alternarStatusEmpresaAction.bind(null, empresaId, !ativa)}>
      <SubmitButton ativa={ativa} />
    </form>
  )
}
