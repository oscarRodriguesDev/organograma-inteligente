'use server'

import { redirect } from 'next/navigation'
import { registrarConversa } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function registrarConversaAction(formData: FormData) {
  const colaboradorId = formData.get('colaboradorId') as string
  const tipoRaw = formData.get('tipo') as string
  const titulo = formData.get('titulo') as string

  if (!colaboradorId || !tipoRaw || !titulo) {
    throw new Error('Campos obrigatórios: colaborador, tipo, título')
  }

  const tiposValidos = ['1:1', 'feedback', 'avaliacao', 'alinhamento', 'desligamento', 'outro'] as const
  const tipo = tiposValidos.includes(tipoRaw as any) ? (tipoRaw as typeof tiposValidos[number]) : 'outro'

  await registrarConversa({
    colaboradorId,
    tipo,
    titulo,
    assunto: (formData.get('assunto') as string) || '',
    resumo: (formData.get('resumo') as string) || '',
    observacoes: (formData.get('observacoes') as string) || '',
    pontosPositivos: (formData.get('pontosPositivos') as string) || '',
    pontosMelhoria: (formData.get('pontosMelhoria') as string) || '',
    realizadaEm: (formData.get('realizadaEm') as string) || new Date().toISOString(),
  })

  revalidatePath('/conversas')
  redirect('/conversas')
}

export async function excluirConversaAction(formData: FormData) {
  const id = formData.get('id') as string
  if (!id) throw new Error('ID é obrigatório')

  const { prisma } = await import('@/lib/prisma')
  await prisma.conversa.delete({ where: { id } })

  revalidatePath('/conversas')
  redirect('/conversas')
}
