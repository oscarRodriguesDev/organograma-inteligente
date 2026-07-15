'use server'

import { revalidatePath } from 'next/cache'
import { removerAvaliacao } from '@/lib/db'

export async function excluirAvaliacaoAction(id: string) {
  await removerAvaliacao(id)
  revalidatePath('/avaliacoes')
}
