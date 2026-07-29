import { NextResponse } from 'next/server'
import { obterAnaliseImpacto, gerarNovaAnaliseImpacto } from '@/lib/analise-impacto-actions'

/**
 * POST /api/ai/analisar-impacto
 * Body: { colaboradorId: string, tipoAcao: 'demissao' | 'promocao', regenerar?: boolean }
 * - Se regenerar=true → força nova análise (ignora cache)
 * - Se regenerar=false/omitted → retorna do cache se existir
 * Client-side: usado pelo OrganogramaFlow (modo simulação)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { colaboradorId, tipoAcao, regenerar } = body

    if (!colaboradorId || !tipoAcao) {
      return NextResponse.json(
        { erro: 'colaboradorId e tipoAcao são obrigatórios' },
        { status: 400 }
      )
    }

    if (tipoAcao !== 'demissao' && tipoAcao !== 'promocao') {
      return NextResponse.json(
        { erro: 'tipoAcao deve ser "demissao" ou "promocao"' },
        { status: 400 }
      )
    }

    // Se o usuário pediu para regenerar, força nova análise
    if (regenerar) {
      const result = await gerarNovaAnaliseImpacto(colaboradorId, tipoAcao)
      if (!result.sucesso) {
        return NextResponse.json(
          { erro: result.erro || 'Erro ao gerar análise' },
          { status: 500 }
        )
      }
      return NextResponse.json({
        sucesso: true,
        dados: result.dados,
        fonte: 'nova',
      })
    }

    // Tenta cache primeiro
    const cache = await obterAnaliseImpacto(colaboradorId, tipoAcao)
    if (cache) {
      return NextResponse.json({
        sucesso: true,
        dados: cache,
        fonte: 'cache',
      })
    }

    // Não achou no cache — gera nova
    const result = await gerarNovaAnaliseImpacto(colaboradorId, tipoAcao)
    if (!result.sucesso) {
      return NextResponse.json(
        { erro: result.erro || 'Erro ao gerar análise' },
        { status: 500 }
      )
    }
    return NextResponse.json({
      sucesso: true,
      dados: result.dados,
      fonte: 'nova',
    })
  } catch (err: any) {
    console.error('[AI] erro em analisar-impacto:', err)
    return NextResponse.json(
      { erro: err.message || 'Erro interno' },
      { status: 500 }
    )
  }
}
