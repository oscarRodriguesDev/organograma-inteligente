'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { responderDISC } from '@/lib/db'

export async function responderDISCAction(formData: FormData) {
  const colaboradorId = formData.get('colaboradorId')?.toString()
  if (!colaboradorId) return

  const respostas: { perguntaId: string; nota: number }[] = []

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('pergunta_')) {
      const perguntaId = key.replace('pergunta_', '')
      const nota = Number(value)
      if (nota >= 1 && nota <= 5) {
        respostas.push({ perguntaId, nota })
      }
    }
  }

  await responderDISC(colaboradorId, respostas)
  revalidatePath('/teste-disc')
  revalidatePath('/teste-disc/resultados')
  redirect('/teste-disc')
}
