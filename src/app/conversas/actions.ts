'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { registrarConversa } from '@/lib/db'

export async function excluirConversaAction(id: string) {
  await prisma.conversa.delete({ where: { id } })
  revalidatePath('/conversas')
}

export async function registrarConversaAction(formData: FormData) {
  const colaboradorId = formData.get('colaboradorId')?.toString()
  const tipo = formData.get('tipo')?.toString()
  const titulo = formData.get('titulo')?.toString().trim()
  const assunto = formData.get('assunto')?.toString().trim() || ''
  const resumo = formData.get('resumo')?.toString().trim() || ''
  const pontosPositivos = formData.get('pontosPositivos')?.toString().trim() || ''
  const pontosMelhoria = formData.get('pontosMelhoria')?.toString().trim() || ''
  const observacoes = formData.get('observacoes')?.toString().trim() || ''
  const realizadaEm = formData.get('realizadaEm')?.toString()

  if (!colaboradorId || !tipo || !titulo || !realizadaEm) return

  await registrarConversa({
    colaboradorId,
    tipo: tipo as '1:1' | 'feedback' | 'avaliacao' | 'alinhamento' | 'desligamento' | 'outro',
    titulo,
    assunto,
    resumo,
    pontosPositivos,
    pontosMelhoria,
    observacoes,
    realizadaEm,
  })

  revalidatePath('/conversas')
  redirect('/conversas')
}
