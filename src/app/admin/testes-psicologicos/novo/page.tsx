import { getSession } from '@/lib/auth'
import { Papel } from '@/lib/types'
import { redirect } from 'next/navigation'
import { listarEmpresasAction } from '@/lib/admin-psich-actions'
import { CriarTesteForm } from './criar-teste-form'

export default async function NovoTestePage() {
  const session = await getSession()
  if (!session || session.papel !== Papel.ADMIN_PSICH) {
    redirect('/login')
  }

  const empresas = await listarEmpresasAction()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Novo Teste Psicológico</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Crie um novo teste com perguntas e defina para quais empresas estará disponível
        </p>
      </div>

      <CriarTesteForm empresas={empresas} />
    </div>
  )
}
