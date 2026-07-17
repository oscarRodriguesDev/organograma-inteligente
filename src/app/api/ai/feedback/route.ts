import { NextResponse } from 'next/server'
import { gerarFeedbackIA } from '@/lib/ai/ai-actions'

/**
 * POST /api/ai/feedback
 * Body: { avaliadorId, avaliadoId, criterios: [{criterio, nota}] }
 * Client-side: usado pelo formulário de avaliação (se for client component)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { avaliadorId, avaliadoId, criterios } = body

    if (!avaliadorId || !avaliadoId || !criterios) {
      return NextResponse.json(
        { erro: 'avaliadorId, avaliadoId e criterios são obrigatórios' },
        { status: 400 }
      )
    }

    const result = await gerarFeedbackIA(avaliadorId, avaliadoId, criterios)
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[AI] erro em feedback:', err)
    return NextResponse.json(
      { erro: err.message || 'Erro interno' },
      { status: 500 }
    )
  }
}
