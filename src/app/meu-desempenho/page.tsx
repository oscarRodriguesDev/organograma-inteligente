import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { obterDadosDesempenho } from './actions'
import MeuDesempenhoClient from './MeuDesempenhoClient'

export default async function MeuDesempenhoPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const dados = await obterDadosDesempenho(session.colaboradorId)

  // Na página /meu-desempenho, o colaborador sempre vê o próprio desempenho
  // Se quiser ver de outra pessoa, isso será via outra rota (futuro)
  const isProprio = true
  const isGestor = ['CEO', 'DIRETOR', 'GERENTE', 'SUPERVISOR', 'GESTOR', 'RH', 'ADMIN_PLATAFORMA', 'ADMIN_SUPORTE'].includes(session.papel)

  return (
    <MeuDesempenhoClient
      dados={dados}
      isProprio={isProprio}
      isGestor={isGestor}
    />
  )
}
