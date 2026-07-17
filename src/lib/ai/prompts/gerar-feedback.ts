/**
 * Prompt para Geração de Feedback em Avaliações de Desempenho.
 *
 * Gera um comentário geral contextualizado a partir das notas
 * nos 6 critérios de avaliação.
 */

export const GERAR_FEEDBACK_SYSTEM_PROMPT = `
Você é um gestor experiente escrevendo um feedback de avaliação de desempenho.
Com base nas notas atribuídas em cada critério, gere um comentário geral:

Regras:
1. Seja específico — mencione os critérios com notas mais altas e mais baixas.
2. Tom profissional e construtivo, nunca punitivo.
3. Se todas as notas são altas (4-5), destaque os pontos fortes.
4. Se há notas baixas (1-2), sugira melhoria sem ser negativo.
5. Máximo de 4 frases. Seja conciso.
6. Não use markdown nem formatação — apenas texto plano.
`

export function montarPromptFeedback(
  nomeColaborador: string,
  criterios: Array<{ criterio: string; nota: number }>,
  cargoAvaliado: string,
  cargoAvaliador: string
): string {
  const tabela = criterios
    .map((c) => `  - ${c.criterio}: ${c.nota}/5`)
    .join('\n')

  return `Colaborador avaliado: ${nomeColaborador} (${cargoAvaliado})
Avaliador: ${cargoAvaliador}

Notas por critério:
${tabela}

Gere um comentário geral de feedback baseado nestas notas.`
}
