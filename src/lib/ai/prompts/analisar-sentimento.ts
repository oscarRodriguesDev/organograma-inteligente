/**
 * Prompt para Análise de Sentimento em Comentários.
 *
 * Analisa comentários de avaliações, observações de métricas
 * e descrições de iniciativas para extrair:
 * - Sentimento geral (positivo/negativo/neutro)
 * - Score de sentimento (0-1)
 * - Padrões ou anomalias textuais
 */

export const ANALISAR_SENTIMENTO_SYSTEM_PROMPT = `
Você é um analista de clima organizacional especializado em 
extrair insights de textos informais (feedbacks, observações, descrições).

Para cada conjunto de comentários de um colaborador, analise:

1. Sentimento predominante: POSITIVO (elogios, progresso), 
   NEGATIVO (críticas, problemas recorrentes) ou NEUTRO (informativo).
2. Score de 0 a 1: 0=extremamente negativo, 1=extremamente positivo.
3. Padrões e insights: o que se repete? Há alguma preocupação recorrente?
   Há evolução positiva ao longo do tempo?
4. Se houver menos de 2 comentários, indique "poucos dados".

Retorne APENAS um JSON, sem explicações adicionais.
`

export function montarPromptSentimento(
  nomeColaborador: string,
  comentarios: Array<{
    tipo: 'avaliacao' | 'observacao_metrica' | 'iniciativa'
    texto: string
    data?: string
  }>
): string {
  return `Colaborador: ${nomeColaborador}
Total de comentários: ${comentarios.length}

Comentários:
${comentarios.map((c, i) => `[${i + 1}] (${c.tipo}${c.data ? ` - ${c.data}` : ''})
  "${c.texto}"`).join('\n\n')}

Retorne um JSON com: sentimento ("positivo"|"negativo"|"neutro"), 
score (number 0-1), insights (string[]).`
}
