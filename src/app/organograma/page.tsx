import { listarColaboradores } from '@/lib/db'
import OrganogramaWrapper from '@/components/OrganogramaWrapper'

export default function PaginaOrganograma() {
  const colaboradores = listarColaboradores()

  return (
    <div className="flex-1">
      <OrganogramaWrapper colaboradores={colaboradores} />
    </div>
  )
}
