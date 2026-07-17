/**
 * Fallbacks determinísticos — usados quando a IA falha ou está em modo mock.
 *
 * Cada função de IA tem uma versão fallback que retorna um resultado
 * "seguro" baseado em regras, sem chamar LLM.
 */

import type { Colaborador, Avaliacao, MetricaMensal } from '@/lib/types'
import { obterSubordinados } from '@/lib/simulacao'

// ─── Fallback para Sugestão de Candidatos ───────────────

export function fallbackSugerirCandidatos(
  candidatos: Colaborador[],
  avaliacoes: Avaliacao[],
  metricas: MetricaMensal[],
  todosColaboradores: Colaborador[]
): Array<{ colaborador: Colaborador; score: number; justificativa: string }> {
  return candidatos.map((c) => {
    const avaliacoesCol = avaliacoes.filter((a) => a.avaliadoId === c.id)
    const notas = avaliacoesCol.flatMap((a) => a.criterios.map((cr) => cr.nota))
    const media = notas.length > 0 ? notas.reduce((s, n) => s + n, 0) / notas.length : 0

    const metricasCol = metricas.filter((m) => m.colaboradorId === c.id)
    const ultima = metricasCol[metricasCol.length - 1]
    const perfil =
      !ultima ? 0 : ultima.faltasInjustificadas > 2 || ultima.horasAtraso > 4 ? -1 : 1.5

    const qtdSub = obterSubordinados(todosColaboradores, c.id).length
    const score = media * 2 + perfil + qtdSub * 0.5

    const justificativa = perfil < 0
      ? 'Candidato com perfil inadequado (faltas/atrasos).'
      : media >= 4.5
        ? `Excelente média de avaliações (${media.toFixed(1)}).`
        : media >= 3.5
          ? `Boa média de avaliações (${media.toFixed(1)}).`
          : `Média de avaliações regular (${media.toFixed(1)}).`

    return { colaborador: c, score, justificativa }
  }).sort((a, b) => b.score - a.score)
}

// ─── Fallback para Feedback de Avaliação ────────────────

export function fallbackGerarFeedback(
  notas: { criterio: string; nota: number }[]
): string {
  const media = notas.reduce((s, n) => s + n.nota, 0) / notas.length
  const maisAlto = notas.reduce((best, n) => (n.nota > best.nota ? n : best), notas[0])
  const maisBaixo = notas.reduce((worst, n) => (n.nota < worst.nota ? n : worst), notas[0])

  const parts: string[] = []

  if (media >= 4) {
    parts.push('O colaborador apresenta um desempenho geral muito bom.')
  } else if (media >= 3) {
    parts.push('O colaborador apresenta um desempenho satisfatório.')
  } else {
    parts.push('O colaborador precisa de atenção em algumas áreas.')
  }

  parts.push(
    `Destaque positivo em "${maisAlto.criterio}" (nota ${maisAlto.nota}).`
  )

  if (maisBaixo.nota < 3) {
    parts.push(
      `Atenção necessária em "${maisBaixo.criterio}" (nota ${maisBaixo.nota}).`
    )
  }

  parts.push('Recomenda-se feedback contínuo para manutenção e evolução do desempenho.')

  return parts.join(' ')
}

// ─── Fallback para Redação de Iniciativa ────────────────

export function fallbackSugerirIniciativa(
  esboco: string
): { titulo: string; descricao: string; resultado: string } {
  return {
    titulo: esboco.slice(0, 60) || 'Nova iniciativa',
    descricao: esboco || 'Registro de iniciativa do colaborador.',
    resultado: 'Resultado a ser mensurado após implementação.',
  }
}

// ─── Fallback para Análise de Sentimento ────────────────

export function fallbackAnalisarSentimento(
  _comentarios: string[]
): { sentimento: 'positivo' | 'negativo' | 'neutro'; score: number; insights: string[] } {
  return {
    sentimento: 'neutro',
    score: 0.5,
    insights: [
      'Análise de sentimento indisponível sem IA configurada.',
      'Defina NVIDIA_API_KEY para análises mais precisas.',
    ],
  }
}
