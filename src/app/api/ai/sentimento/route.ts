import { NextResponse } from 'next/server'
import { analisarSentimentoIA } from '@/lib/ai/ai-actions'

/**
 * POST /api/ai/sentimento
 * Body: { colaboradorId }
 * Client-side: análise de sentimento na página do colaborador
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { colaboradorId } = body

    if (!colaboradorId) {
      return NextResponse.json(
        { erro: 'colaboradorId é obrigatório' },
        { status: 400 }
      )
    }

    const result = await analisarSentimentoIA(colaboradorId)
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[AI] erro em sentimento:', err)
    return NextResponse.json(
      { erro: err.message || 'Erro interno' },
      { status: 500 }
    )
  }
}
