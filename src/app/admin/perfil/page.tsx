import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { obterInfoAdmin } from '@/lib/admin-actions'
import PerfilAdminClient from './PerfilAdminClient'

export default async function AdminPerfilPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const perfil = await obterInfoAdmin()

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Gerencie suas informações pessoais, foto e preferências
        </p>
      </div>

      <PerfilAdminClient perfil={perfil} />
    </div>
  )
}
