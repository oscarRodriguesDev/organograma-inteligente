import { listarColaboradores } from '@/lib/db'
import { Papel } from '@/lib/types'
import OrganogramaWrapper from '@/components/OrganogramaWrapper'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function PaginaOrganograma() {
  const session = await getSession()
  if (!session) redirect('/login')

  let colaboradores = await listarColaboradores()

  // Filtra admins da plataforma (não devem aparecer no organograma das empresas)
  colaboradores = colaboradores.filter(
    (c) => c.papel !== Papel.ADMIN_PLATAFORMA && c.papel !== Papel.ADMIN_SUPORTE
  )

  // Se o usuário for de uma empresa, filtra apenas os colaboradores da empresa
  if (session.empresaId) {
    colaboradores = colaboradores.filter((c) => c.empresaId === session.empresaId)
  }

  return (
    <div className="flex-1">
      <OrganogramaWrapper colaboradores={colaboradores} />
    </div>
  )
}
