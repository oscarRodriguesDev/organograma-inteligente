'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { registrarPesquisaSentimento } from '@/lib/db'

export async function registrarSentimentoAction(formData: FormData) {
  const colaboradorId = formData.get('colaboradorId')?.toString()
  const sentimento = formData.get('sentimento')?.toString()
  const nota = Number(formData.get('nota')) || 3
  const engajamento = formData.get('engajamento')?.toString()
  const motivacao = formData.get('motivacao')?.toString()
  const pertencimento = formData.get('pertencimento')?.toString()
  const comentario = formData.get('comentario')?.toString() || ''

  if (!colaboradorId || !sentimento) return

  await registrarPesquisaSentimento({
    colaboradorId,
    sentimento: sentimento as 'muito_positivo' | 'positivo' | 'neutro' | 'negativo' | 'muito_negativo',
    nota,
    engajamento: engajamento ? Number(engajamento) : undefined,
    motivacao: motivacao ? Number(motivacao) : undefined,
    pertencimento: pertencimento ? Number(pertencimento) : undefined,
    comentario,
  })

  revalidatePath('/pesquisa-sentimento')
  redirect('/pesquisa-sentimento')
}
