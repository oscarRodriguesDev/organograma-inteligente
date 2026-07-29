'use server'

import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function listarTestesNavbarAction(): Promise<{ id: string; titulo: string; tipo: string }[]> {
  const session = await getSession()
  if (!session?.empresaId) return []

  try {
    const testes = await prisma.empresaTesteDisponivel.findMany({
      where: { empresaId: session.empresaId, teste: { ativo: true } },
      select: {
        teste: {
          select: { id: true, titulo: true, tipo: true },
        },
      },
      orderBy: { teste: { titulo: 'asc' } },
    })
    return testes.map(t => t.teste)
  } catch {
    return []
  }
}
