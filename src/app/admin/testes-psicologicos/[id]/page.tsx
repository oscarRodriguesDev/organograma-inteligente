import { getSession } from '@/lib/auth'
import { Papel } from '@/lib/types'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { buscarTesteAction, listarEmpresasAction } from '@/lib/admin-psich-actions'
import { EditarTesteForm } from './editar-teste-form'

export default async function EditarTestePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()
  if (!session || session.papel !== Papel.ADMIN_PSICH) {
    redirect('/login')
  }

  const [teste, empresas] = await Promise.all([
    buscarTesteAction(id),
    listarEmpresasAction(),
  ])

  if (!teste) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Editar Teste</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Edite as informações, perguntas e disponibilidade do teste
        </p>
      </div>

      <EditarTesteForm teste={teste} empresas={empresas} />
    </div>
  )
}
