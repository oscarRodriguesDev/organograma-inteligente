import { NextResponse } from 'next/server'
import { sugerirCandidatosComIA } from '@/lib/ai/ai-actions'

/**
 * POST /api/ai/sugerir-candidatos
 * Body: { cargoVago: string, liderVagoId: string }
 * Client-side: usado pelo OrganogramaFlow (modo simulação)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { cargoVago, liderVagoId } = body

    if (!cargoVago || !liderVagoId) {
      return NextResponse.json(
        { erro: 'cargoVago e liderVagoId são obrigatórios' },
        { status: 400 }
      )
    }

    const result = await sugerirCandidatosComIA(cargoVago, liderVagoId)
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[AI] erro em sugerir-candidatos:', err)
    return NextResponse.json(
      { erro: err.message || 'Erro interno' },
      { status: 500 }
    )
  }
}
