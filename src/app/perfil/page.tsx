import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { obterInfoPerfil } from '@/lib/colaborador-actions'
import PerfilClient from './PerfilClient'

export default async function PerfilPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const perfil = await obterInfoPerfil()

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Gerencie suas informações pessoais, foto e preferências
          </p>
        </div>

        <PerfilClient perfil={perfil} />
      </div>
    </div>
  )
}
