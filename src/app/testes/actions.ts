'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { salvarRespostasTeste } from '@/lib/db'

export async function responderTesteAction(
  testeId: string,
  respostas: { perguntaId: string; resposta: string }[]
) {
  const session = await getSession()
  if (!session || !session.empresaId) {
    throw new Error('Não autorizado')
  }

  const ok = await salvarRespostasTeste(testeId, session.colaboradorId, respostas)
  if (ok) {
    revalidatePath(`/testes/${testeId}`)
  }
  return { ok }
}
