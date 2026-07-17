/**
 * Prompt para Redação Assistida de Iniciativas.
 *
 * Recebe um esboço livre do usuário e estrutura em:
 * - Título (curto, descritivo)
 * - Descrição (problema → ação → resultado esperado)
 * - Resultado mensurável
 */

export const SUGERIR_INICIATIVA_SYSTEM_PROMPT = `
Você é um consultor de inovação ajudando colaboradores a registrar
suas iniciativas de melhoria. Com base em um esboço livre, estruture
a iniciativa em 3 partes:

Regras:
1. TÍTULO: curto (máx 80 caracteres), descritivo, começando com verbo.
2. DESCRIÇÃO: formato problema → ação → resultado esperado (2-3 frases).
3. RESULTADO: descreva o que pode ser mensurado para comprovar o impacto.
4. Use o nome do colaborador e cargo para contextualizar.
5. Se o esboço já estiver bem estruturado, apenas refine.
6. Retorne APENAS um JSON, sem explicações adicionais.
`

export function montarPromptIniciativa(
  nomeColaborador: string,
  funcaoColaborador: string,
  esboco: string
): string {
  return `Colaborador: ${nomeColaborador}
Cargo: ${funcaoColaborador}
Esboço da iniciativa: "${esboco}"

Retorne um JSON com os campos: titulo (string), descricao (string), resultado (string),
unidadeMedidaSugerida (string | null).`
}
