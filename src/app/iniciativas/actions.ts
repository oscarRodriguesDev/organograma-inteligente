'use server'

import { revalidatePath } from 'next/cache'
import { removerIniciativa } from '@/lib/db'

export async function excluirIniciativaAction(id: string) {
  await removerIniciativa(id)
  revalidatePath('/iniciativas')
}
