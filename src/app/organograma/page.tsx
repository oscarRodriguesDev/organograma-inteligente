import { listarColaboradores } from '@/lib/db'
import OrganogramaWrapper from '@/components/OrganogramaWrapper'

export default function PaginaOrganograma() {
  const colaboradores = listarColaboradores()

  return <OrganogramaWrapper colaboradores={colaboradores} />
}
