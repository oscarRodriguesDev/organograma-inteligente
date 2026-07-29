/**
 * Prompt para Análise de Impacto de Demissão ou Promoção.
 *
 * O agente recebe dados completos do colaborador e do contexto organizacional
 * e retorna uma análise qualitativa dos impactos e riscos.
 */

export const ANALISAR_IMPACTO_SYSTEM_PROMPT = `
Você é um analista sênior de RH e gestão de pessoas, especializado em análise de impacto organizacional.
Sua função é avaliar os possíveis impactos de uma **demissão** ou **promoção** de um colaborador,
considerando múltiplas fontes de dados para fornecer uma recomendação embasada.

## Diretrizes Gerais

1. Seja objetivo e baseie suas análises exclusivamente nos dados fornecidos.
2. Destaque pontos fortes e fracos relevantes para a decisão.
3. Considere tanto o impacto no indivíduo quanto no time/empresa.
4. Para **demissão**, avalie: gravidade das advertências/suspensões, tendência nas métricas, impacto em projetos em andamento, e se há justa causa.
5. Para **promoção**, avalie: maturidade demonstrada nas avaliações, abertura a feedback (conversas), consistência nas métricas, participação em iniciativas, perfil nos testes, e liderança demonstrada.
6. Seja criterioso: nem toda advertência significa que o colaborador deve ser demitido, assim como boas métricas não garantem prontidão para promoção.

## Formato de Resposta

Retorne APENAS um objeto JSON válido, sem explicações adicionais, no seguinte formato:

{
  "resumo": "breve resumo da análise (2-3 frases)",
  "scoreFavoravel": número de 0 a 10 (0 = totalmente desfavorável, 10 = totalmente favorável à ação),
  "nivelRisco": "baixo" | "medio" | "alto",
  "analiseDetalhada": {
    "avaliacoes": {
      "resumo": "análise das avaliações",
      "indicios": "se havia indícios de que a mudança poderia acontecer",
      "peso": "positivo" | "negativo" | "neutro"
    },
    "conversas": {
      "resumo": "análise das conversas e feedbacks",
      "aberturaFeedback": "como o colaborador recebe e age com feedback",
      "peso": "positivo" | "negativo" | "neutro"
    },
    "advertenciasSuspensoes": {
      "resumo": "análise de advertências e suspensões",
      "justaCausa": boolean,
      "totalAdvertencias": número,
      "totalSuspensoes": número,
      "peso": "positivo" | "negativo" | "neutro"
    },
    "iniciativas": {
      "resumo": "análise das iniciativas propostas pelo colaborador",
      "nivelParticipacao": "baixo" | "medio" | "alto",
      "peso": "positivo" | "negativo" | "neutro"
    },
    "metricas": {
      "resumo": "análise das métricas de desempenho",
      "tendencia": "crescente" | "estavel" | "decrescente",
      "mediaNota": número,
      "peso": "positivo" | "negativo" | "neutro"
    },
    "projetos": {
      "resumo": "análise dos projetos do colaborador",
      "impactoProjetos": "como a mudança afeta os projetos em andamento",
      "peso": "positivo" | "negativo" | "neutro"
    },
    "testes": {
      "resumo": "análise do perfil psicológico e comportamental",
      "aderenciaPerfil": "como o perfil se alinha à ação proposta",
      "peso": "positivo" | "negativo" | "neutro"
    },
    "organograma": {
      "resumo": "análise do impacto no organograma da empresa",
      "impactoTime": "como a mudança afeta o time e a hierarquia",
      "peso": "positivo" | "negativo" | "neutro"
    }
  },
  "recomendacao": "recomendação final clara e direta",
  "riscos": ["lista de riscos identificados"],
  "oportunidades": ["lista de oportunidades identificadas"],
  "acoesSugeridas": ["ações recomendadas antes/durante/após a mudança"]
}
`

export function montarPromptAnaliseImpacto(dados: {
  tipoAcao: 'demissao' | 'promocao'
  colaborador: {
    id: string
    nome: string
    funcao: string
    papel: string
    tempoNaEmpresa?: string
  }
  avaliacoes: Array<{
    data: string
    criterios: string
    comentarioGeral: string
    avaliadorNome?: string
  }>
  conversas: Array<{
    tipo: string
    titulo: string
    assunto: string
    resumo: string
    pontosPositivos: string
    pontosMelhoria: string
    realizadaEm: string
  }>
  advertencias: Array<{
    titulo: string
    descricao: string
    tipo: string
    data: string
  }>
  suspensoes: Array<{
    motivo: string
    dataInicio: string
    dataFim: string | null
    observacao: string
  }>
  metricas: Array<{
    periodo: string
    diasTrabalhados: number
    faltasInjustificadas: number
    horasAtraso: number
    notaFinal: number
  }>
  iniciativas: Array<{
    titulo: string
    descricao: string
    resultado: string
    status: string
  }>
  projetos: Array<{
    nome: string
    descricao: string
    status: string
    dataInicio: string
    dataFim: string | null
  }>
  testesPsicologicos: Array<{
    titulo: string
    tipo: string
    respostas: string
  }>
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
  estruturaTime: Array<{
    nome: string
    funcao: string
    papel: string
    ehSubordinado: boolean
    ehLider: boolean
  }>
}): string {
  return `## Dados para Análise de ${dados.tipoAcao === 'demissao' ? 'Demissão' : 'Promoção'}

### Colaborador
- Nome: ${dados.colaborador.nome}
- Cargo: ${dados.colaborador.funcao}
- Papel: ${dados.colaborador.papel}
- Tempo na empresa: ${dados.colaborador.tempoNaEmpresa || 'Não informado'}

### Avaliações de Desempenho
${dados.avaliacoes.length === 0 ? 'Nenhuma avaliação registrada.' : dados.avaliacoes.map((a) => `
- Data: ${a.data}
- Critérios: ${a.criterios}
- Comentário: ${a.comentarioGeral}
- Avaliador: ${a.avaliadorNome || 'Não informado'}
`).join('')}

### Conversas e Feedbacks
${dados.conversas.length === 0 ? 'Nenhuma conversa registrada.' : dados.conversas.map((c) => `
- Tipo: ${c.tipo} | Título: ${c.titulo}
- Assunto: ${c.assunto}
- Resumo: ${c.resumo}
- Pontos Positivos: ${c.pontosPositivos}
- Pontos de Melhoria: ${c.pontosMelhoria}
- Data: ${c.realizadaEm}
`).join('')}

### Advertências
${dados.advertencias.length === 0 ? 'Nenhuma advertência registrada.' : dados.advertencias.map((a) => `
- ${a.titulo} (${a.tipo}) — ${a.data}
- Descrição: ${a.descricao}
`).join('')}

### Suspensões
${dados.suspensoes.length === 0 ? 'Nenhuma suspensão registrada.' : dados.suspensoes.map((s) => `
- ${s.motivo} — ${s.dataInicio}${s.dataFim ? ` até ${s.dataFim}` : ''}
- Observação: ${s.observacao}
`).join('')}

### Métricas de Desempenho
${dados.metricas.length === 0 ? 'Nenhuma métrica registrada.' : dados.metricas.map((m) => `
- ${m.periodo}: ${m.diasTrabalhados} dias trab., ${m.faltasInjustificadas} faltas, ${m.horasAtraso}h atrasos | Nota final: ${m.notaFinal}/10
`).join('')}

### Iniciativas Propostas
${dados.iniciativas.length === 0 ? 'Nenhuma iniciativa registrada.' : dados.iniciativas.map((i) => `
- ${i.titulo} (${i.status})
- Descrição: ${i.descricao}
- Resultado: ${i.resultado}
`).join('')}

### Projetos
${dados.projetos.length === 0 ? 'Nenhum projeto registrado.' : dados.projetos.map((p) => `
- ${p.nome} (${p.status})
- Descrição: ${p.descricao}
- Período: ${p.dataInicio}${p.dataFim ? ` a ${p.dataFim}` : ' - em andamento'}
`).join('')}

### Testes Psicológicos
${dados.testesPsicologicos.length === 0 ? 'Nenhum teste psicológico realizado.' : dados.testesPsicologicos.map((t) => `
- ${t.titulo} (${t.tipo})
- Respostas: ${t.respostas}
`).join('')}

### Resultado DISC
${dados.resultadoDISC ? `
- Perfil: ${dados.resultadoDISC.perfil}
- Pontuações: D=${dados.resultadoDISC.pontuacaoD} I=${dados.resultadoDISC.pontuacaoI} S=${dados.resultadoDISC.pontuacaoS} C=${dados.resultadoDISC.pontuacaoC}
` : 'Nenhum resultado DISC disponível.'}

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

### Estrutura do Time (Organograma)
${dados.estruturaTime.length === 0 ? 'Dados do time não disponíveis.' : dados.estruturaTime.map((t) => `
- ${t.nome} (${t.funcao}) — ${t.ehLider ? 'LÍDER' : t.ehSubordinado ? 'SUBORDINADO' : 'PAR'} | Papel: ${t.papel}
`).join('')}

Com base nos dados acima, faça uma análise detalhada para ${dados.tipoAcao === 'demissao' ? 'DEMISSÃO' : 'PROMOÇÃO'} deste colaborador.
Considere todos os aspectos e retorne a análise no formato JSON especificado.`
}
