import { NextResponse } from 'next/server'
import { listFeatures } from '@/lib/features'

/**
 * GET /api/ai/features
 * Retorna o estado de todas as feature flags de IA.
 * O cliente usa isso para saber se deve chamar a IA ou usar fallback.
 */
export async function GET() {
  return NextResponse.json(listFeatures())
}
