/**
 * Prompt para Análise de Perfil Comportamental.
 *
 * O agente analisa os dados do colaborador (DISC, fit cultural, avaliações,
 * conversas, iniciativas, métricas) e gera um resumo do perfil comportamental.
 * Também calcula a aderência entre um potencial líder e sua futura equipe.
 */

export const ANALISAR_PERFIL_COMPORTAMENTAL_SYSTEM_PROMPT = `
Você é um analista sênior de perfil comportamental e dinâmica de equipes,
especializado em psicologia organizacional e compatibilidade interpessoal.

Sua função é:
1. Analisar o perfil comportamental de um colaborador com base em múltiplas fontes
2. Calcular a aderência entre um potencial líder e os membros da equipe que ficarão sob sua liderança
3. Sugerir a melhor opção de promoção considerando compatibilidade comportamental

## Diretrizes Gerais

1. Baseie sua análise exclusivamente nos dados fornecidos.
2. Considere: resultado DISC, fit cultural, scores consolidados, avaliações, feedbacks de conversas, iniciativas e métricas.
3. Seja objetivo e prático — o propósito é apoiar decisões de promoção.
4. A aderência líder-equipe deve considerar complementaridade de perfis, não apenas similaridade.

## Perfil DISC (referência)
- **D (Dominância)**: Decidido, direto, orientado a resultados, desafiador.
- **I (Influência)**: Comunicativo, otimista, entusiasmado, persuasivo.
- **S (Estabilidade)**: Paciente, consistente, leal, bom ouvinte.
- **C (Conformidade)**: Analítico, preciso, meticuloso, orientado a regras.

## Formato de Resposta — Análise Individual

Retorne APENAS um objeto JSON válido, sem explicações adicionais:

{
  "perfilResumo": "resumo conciso do perfil comportamental (2-3 frases)",
  "dimensoes": {
    "dominancia": { "nivel": "baixo" | "medio" | "alto", "descricao": "..." },
    "influencia": { "nivel": "baixo" | "medio" | "alto", "descricao": "..." },
    "estabilidade": { "nivel": "baixo" | "medio" | "alto", "descricao": "..." },
    "conformidade": { "nivel": "baixo" | "medio" | "alto", "descricao": "..." }
  },
  "forcas": ["força 1", "força 2", "força 3"],
  "pontosAtencao": ["ponto 1", "ponto 2"],
  "estiloLideranca": "descrição do estilo de liderança natural (ou potencial)",
  "recomendacaoAmbiente": "tipo de ambiente e equipe ideal para este perfil"
}

## Formato de Resposta — Aderência Líder-Equipe

{
  "lider": {
    "nome": "nome do líder",
    "perfil": "resumo do perfil"
  },
  "time": [
    {
      "nome": "nome do membro",
      "perfil": "resumo do perfil",
      "aderencia": 0-100,
      "justificativa": "por que há boa ou baixa aderência"
    }
  ],
  "aderenciaGeral": 0-100,
  "analise": "análise geral da compatibilidade entre o líder e a equipe",
  "riscos": ["risco 1", "risco 2"],
  "oportunidades": ["oportunidade 1", "oportunidade 2"],
  "recomendacao": "recomendação final sobre a promoção"
}

## Formato de Resposta — Melhor Candidato (múltiplas opções)

{
  "candidatos": [
    {
      "nome": "nome",
      "perfilResumo": "resumo do perfil",
      "aderenciaEquipe": 0-100,
      "scoreCompatibilidade": 0-100,
      "pontosFortes": ["..."],
      "pontosRisco": ["..."]
    }
  ],
  "melhorOpcao": "nome do candidato recomendado",
  "justificativa": "por que este candidato é a melhor opção",
  "scoreComparativo": {
    "melhor": 0-100,
    "segundo": 0-100
  }
}
`

export function montarPromptAnalisePerfilIndividual(dados: {
  colaborador: {
    nome: string
    funcao: string
    papel: string
    tempoNaEmpresa?: string
  }
  resultadoDISC?: {
    perfil: string
    pontuacaoD: number
    pontuacaoI: number
    pontuacaoS: number
    pontuacaoC: number
  }
  scoreColaborador?: {
    scoreGeral: number
    scoreFitCultural: number
    scoreDISC: number
    scoreSentimento: number
    scoreConversas: number
    scoreAvaliacoes: number
    scoreMetricas: number
    scoreIniciativas: number
  }
  fitCultural?: Array<{
    dimensao: string
    nota: number
  }>
  avaliacoes?: Array<{
    criterios: string
    comentarioGeral: string
  }>
  conversas?: Array<{
    tipo: string
    resumo: string
    pontosPositivos: string
    pontosMelhoria: string
  }>
  metricas?: Array<{
    notaFinal: number
  }>
}): string {
  return `## Análise de Perfil Comportamental Individual

### Colaborador
- Nome: ${dados.colaborador.nome}
- Cargo: ${dados.colaborador.funcao}
- Papel: ${dados.colaborador.papel}
- Tempo na empresa: ${dados.colaborador.tempoNaEmpresa || 'Não informado'}

### Resultado DISC
${dados.resultadoDISC ? `
- Perfil: ${dados.resultadoDISC.perfil}
- Dominância (D): ${dados.resultadoDISC.pontuacaoD}/10
- Influência (I): ${dados.resultadoDISC.pontuacaoI}/10
- Estabilidade (S): ${dados.resultadoDISC.pontuacaoS}/10
- Conformidade (C): ${dados.resultadoDISC.pontuacaoC}/10
` : 'Nenhum resultado DISC disponível.'}

### Fit Cultural
${dados.fitCultural && dados.fitCultural.length > 0 ? dados.fitCultural.map((f) => `
- ${f.dimensao}: ${f.nota}/5
`).join('') : 'Nenhum dado de fit cultural disponível.'}

### Score Consolidado
${dados.scoreColaborador ? `
- Score Geral: ${dados.scoreColaborador.scoreGeral}/10
- Fit Cultural: ${dados.scoreColaborador.scoreFitCultural}/10
- DISC: ${dados.scoreColaborador.scoreDISC}/10
- Sentimento: ${dados.scoreColaborador.scoreSentimento}/10
- Conversas: ${dados.scoreColaborador.scoreConversas}/10
- Avaliações: ${dados.scoreColaborador.scoreAvaliacoes}/10
- Métricas: ${dados.scoreColaborador.scoreMetricas}/10
- Iniciativas: ${dados.scoreColaborador.scoreIniciativas}/10
` : 'Nenhum score consolidado disponível.'}

### Avaliações de Desempenho
${dados.avaliacoes && dados.avaliacoes.length > 0 ? dados.avaliacoes.map((a) => `
- Critérios: ${a.criterios}
- Comentário: ${a.comentarioGeral}
`).join('') : 'Nenhuma avaliação registrada.'}

### Conversas e Feedbacks
${dados.conversas && dados.conversas.length > 0 ? dados.conversas.map((c) => `
- Tipo: ${c.tipo}
- Resumo: ${c.resumo}
- Pontos Positivos: ${c.pontosPositivos}
- Pontos de Melhoria: ${c.pontosMelhoria}
`).join('') : 'Nenhuma conversa registrada.'}

### Métricas
${dados.metricas && dados.metricas.length > 0 ? `Média das notas finais: ${(dados.metricas.reduce((s, m) => s + m.notaFinal, 0) / dados.metricas.length).toFixed(1)}/10` : 'Nenhuma métrica registrada.'}

Com base nos dados acima, faça uma análise detalhada do perfil comportamental deste colaborador.
Considere o DISC, fit cultural, feedbacks e desempenho para traçar um perfil preciso.
Retorne a análise no formato JSON especificado.`
}

export function montarPromptAderenciaLiderEquipe(dados: {
  lider: {
    nome: string
    funcao: string
    perfilComportamental: string
  }
  membros: Array<{
    nome: string
    funcao: string
    perfilComportamental: string
  }>
}): string {
  return `## Análise de Aderência Líder-Equipe

### Líder (potencial)
- Nome: ${dados.lider.nome}
- Cargo: ${dados.lider.funcao}
- Perfil Comportamental: ${dados.lider.perfilComportamental}

### Membros da Equipe
${dados.membros.map((m, i) => `
#### Membro ${i + 1}: ${m.nome}
- Cargo: ${m.funcao}
- Perfil Comportamental: ${m.perfilComportamental}
`).join('')}

Com base nos perfis comportamentais acima, calcule a aderência entre o líder e cada membro da equipe,
e a aderência geral do time. Considere complementaridade de perfis, estilos de comunicação,
e potenciais conflitos ou sinergias. Retorne a análise no formato JSON especificado.`
}

export function montarPromptMelhorCandidato(dados: {
  cargoAlvo: string
  candidatos: Array<{
    nome: string
    funcao: string
    perfilComportamental: string
  }>
  membrosEquipe: Array<{
    nome: string
    funcao: string
    perfilComportamental: string
  }>
}): string {
  return `## Análise de Melhor Candidato para Promoção

### Cargo Alvo
${dados.cargoAlvo}

### Candidatos à Promoção
${dados.candidatos.map((c, i) => `
#### Candidato ${i + 1}: ${c.nome}
- Cargo atual: ${c.funcao}
- Perfil Comportamental: ${c.perfilComportamental}
`).join('')}

### Equipe que será gerenciada
${dados.membrosEquipe.map((m, i) => `
#### Membro ${i + 1}: ${m.nome}
- Cargo: ${m.funcao}
- Perfil Comportamental: ${m.perfilComportamental}
`).join('')}

Com base nos perfis comportamentais dos candidatos e da equipe existente,
avalie quem seria a melhor opção de promoção considerando a compatibilidade
comportamental e de estilo de liderança. Retorne a análise no formato JSON especificado.`
}
