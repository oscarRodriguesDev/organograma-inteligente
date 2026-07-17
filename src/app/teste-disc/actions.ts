'use server'

import { redirect } from 'next/navigation'
import { responderDISC } from '@/lib/db'

export async function responderDISCAction(formData: FormData) {
  const colaboradorId = formData.get('colaboradorId') as string
  if (!colaboradorId) throw new Error('Colaborador é obrigatório')

  const respostas: { perguntaId: string; nota: number }[] = []

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('nota_')) {
      const perguntaId = key.replace('nota_', '')
      const nota = parseInt(value as string, 10)
      if (!isNaN(nota) && nota >= 1 && nota <= 5) {
        respostas.push({ perguntaId, nota })
      }
    }
  }

  if (respostas.length === 0) throw new Error('Nenhuma resposta enviada')

  await responderDISC(colaboradorId, respostas)
  redirect('/teste-disc/resultados')
}
