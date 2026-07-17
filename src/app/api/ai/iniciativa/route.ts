import { NextResponse } from 'next/server'
import { sugerirIniciativaIA } from '@/lib/ai/ai-actions'

/**
 * POST /api/ai/iniciativa
 * Body: { colaboradorId, esboco }
 * Client-side: usado pelo formulário de iniciativa
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { colaboradorId, esboco } = body

    if (!colaboradorId || !esboco) {
      return NextResponse.json(
        { erro: 'colaboradorId e esboco são obrigatórios' },
        { status: 400 }
      )
    }

    const result = await sugerirIniciativaIA(colaboradorId, esboco)
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[AI] erro em iniciativa:', err)
    return NextResponse.json(
      { erro: err.message || 'Erro interno' },
      { status: 500 }
    )
  }
}
