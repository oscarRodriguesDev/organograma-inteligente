'use server'

import { redirect } from 'next/navigation'
import { registrarPesquisaSentimento } from '@/lib/db'

export async function registrarSentimentoAction(formData: FormData) {
  const colaboradorId = formData.get('colaboradorId') as string
  const sentimentoRaw = formData.get('sentimento') as string
  const nota = parseInt(formData.get('nota') as string, 10)

  if (!colaboradorId || !sentimentoRaw || isNaN(nota)) {
    throw new Error('Campos obrigatórios: colaborador, sentimento, nota')
  }

  const sentimentosValidos = ['muito_positivo', 'positivo', 'neutro', 'negativo', 'muito_negativo'] as const
  const sentimento = sentimentosValidos.includes(sentimentoRaw as any)
    ? (sentimentoRaw as typeof sentimentosValidos[number])
    : 'neutro'

  const engajamentoRaw = formData.get('engajamento')
  const motivacaoRaw = formData.get('motivacao')
  const pertencimentoRaw = formData.get('pertencimento')

  await registrarPesquisaSentimento({
    colaboradorId,
    sentimento,
    nota,
    engajamento: engajamentoRaw ? parseInt(engajamentoRaw as string, 10) : undefined,
    motivacao: motivacaoRaw ? parseInt(motivacaoRaw as string, 10) : undefined,
    pertencimento: pertencimentoRaw ? parseInt(pertencimentoRaw as string, 10) : undefined,
    comentario: (formData.get('comentario') as string) || '',
  })

  redirect('/pesquisa-sentimento')
}
