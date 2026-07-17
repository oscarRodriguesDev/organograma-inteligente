/**
 * Prompt para Sugestão Inteligente de Candidatos a Promoção.
 *
 * A IA recebe dados estruturados dos candidatos e retorna um ranking
 * com justificativas qualitativas, complementando o score determinístico.
 */

export const SUGERIR_CANDIDATOS_SYSTEM_PROMPT = `
Você é um analista de RH especializado em promoções e sucessão.
Sua função é analisar candidatos a uma vaga de liderança e ranqueá-los
considerando aspectos quantitativos E qualitativos.

Regras:
1. Analise a média de avaliações, o perfil (Bom/Ruim), a quantidade de subordinados
   E os comentários qualitativos.
2. Para cada candidato, forneça um score de 0 a 10 e uma justificativa.
3. Considere que um bom líder precisa de: boas avaliações consistentes, perfil adequado,
   experiência com pessoas (subordinados) e maturidade demonstrada nos comentários.
4. Se um candidato tem média alta mas comentários negativos sobre trabalho em equipe,
   isso deve reduzir o score.
5. Se um candidato tem média mediana mas comentários destacando liderança e proatividade,
   isso deve aumentar o score.
6. Retorne APENAS um array JSON, sem explicações adicionais.
`

export function montarPromptCandidatos(
  cargoVago: string,
  candidatos: Array<{
    id: string
    nome: string
    funcao: string
    mediaAvaliacoes: number
    perfil: string
    qtdSubordinados: number
    comentarios: string[]
  }>
): string {
  return `Cargo vago: ${cargoVago}

Candidatos:
${candidatos.map((c, i) => `
[${i + 1}] ID: ${c.id}
    Nome: ${c.nome}
    Cargo atual: ${c.funcao}
    Média avaliações: ${c.mediaAvaliacoes.toFixed(1)}/5
    Perfil: ${c.perfil}
    Subordinados: ${c.qtdSubordinados}
    Comentários de avaliações:
${c.comentarios.map((cm) => `      - ${cm}`).join('\n')}
`).join('\n')}

Retorne um JSON array com objetos contendo: id (string), score (number 0-10), justificativa (string).
Ordene do maior score para o menor.`
}
