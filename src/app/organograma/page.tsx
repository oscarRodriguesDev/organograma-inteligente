import { listarColaboradores } from '@/lib/db'
import OrganogramaWrapper from '@/components/OrganogramaWrapper'

export default async function PaginaOrganograma() {
  const colaboradores = await listarColaboradores()

  return (
    <div className="flex-1">
      <OrganogramaWrapper colaboradores={colaboradores} />
    </div>
  )
}
