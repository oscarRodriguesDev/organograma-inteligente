'use server'

import { revalidatePath } from 'next/cache'
import { removerMetrica } from '@/lib/db'

export async function excluirMetricaAction(id: string) {
  await removerMetrica(id)
  revalidatePath('/metricas')
}
