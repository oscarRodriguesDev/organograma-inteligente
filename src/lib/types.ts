// ─── Multi-tenant ──────────────────────────────────
export enum Papel {
  ADMIN_PLATAFORMA = 'ADMIN_PLATAFORMA',
  ADMIN_SUPORTE = 'ADMIN_SUPORTE',
  ADMIN_PSICH = 'ADMIN_PSICH',
  CEO = 'CEO',
  DIRETOR = 'DIRETOR',
  GERENTE = 'GERENTE',
  SUPERVISOR = 'SUPERVISOR',
  GESTOR = 'GESTOR',
  LIDER = 'LIDER',
  OPERACIONAL = 'OPERACIONAL',
  RH = 'RH',
  COLABORADOR = 'COLABORADOR',
}

/** Hierarquia de promoção: posição 0 = base, última = topo */
export const HIERARQUIA_PAPEIS: Papel[] = [
  Papel.OPERACIONAL,
  Papel.LIDER,
  Papel.GESTOR,
  Papel.SUPERVISOR,
  Papel.GERENTE,
  Papel.DIRETOR,
  Papel.CEO,
]

/** Retorna o próximo papel na hierarquia de promoção (ou null se já é o topo) */
export function proximoPapel(papel: Papel): Papel | null {
  const idx = HIERARQUIA_PAPEIS.indexOf(papel)
  if (idx === -1 || idx >= HIERARQUIA_PAPEIS.length - 1) return null
  return HIERARQUIA_PAPEIS[idx + 1]
}

/** Verifica se papelA pode promover papelB (papelA deve ser imediatamente acima) */
export function podePromover(promotor: Papel, promovido: Papel): boolean {
  const idxPromovido = HIERARQUIA_PAPEIS.indexOf(promovido)
  if (idxPromovido === -1) return false
  const prox = HIERARQUIA_PAPEIS[idxPromovido + 1]
  if (!prox) return false
  // O promotor precisa ser no mínimo o papel acima do promovido
  const idxPromotor = HIERARQUIA_PAPEIS.indexOf(promotor)
  return idxPromotor >= idxPromovido + 1
}

/**
 * Calcula o papel de um subordinado com base no papel do líder.
 * O subordinado recebe o papel imediatamente abaixo do líder na hierarquia.
 *
 * Exemplos:
 *   Líder é GESTOR  → subordinado = LIDER
 *   Líder é DIRETOR → subordinado = GERENTE
 *   Líder é CEO     → subordinado = DIRETOR
 *   Sem líder       → OPERACIONAL (base da hierarquia)
 */
export function calcularPapelSubordinado(liderPapel: Papel | null | undefined): Papel {
  if (!liderPapel) return Papel.OPERACIONAL
  const idx = HIERARQUIA_PAPEIS.indexOf(liderPapel)
  if (idx <= 0) return Papel.OPERACIONAL // Se líder é OPERACIONAL ou não encontrado
  return HIERARQUIA_PAPEIS[idx - 1]
}

export interface Empresa {
  id: string
  nome: string
  slug: string
  cnpj: string
  contatoNome: string
  contatoEmail: string
  contatoTelefone: string
  dataContratacao: string
  createdAt: string
  ativa: boolean
}

export interface Plano {
  id: string
  nome: string
  slug: string
  descricao: string
  precoMensal: number
  precoAnual: number
  maxColaboradores: number
  recursos: string[]
  destaque: boolean
  ativo: boolean
  ordem: number
  descontoPercentual: number
  promocaoAtiva: boolean
  promocaoValidade: string | null
  promocaoDescricao: string
}

export interface Assinatura {
  id: string
  empresaId: string
  planoId: string
  status: string
  dataInicio: string
  dataProximoPagamento: string | null
  dataCancelamento: string | null
  ciclo: string
  plano?: Plano
}

export interface Pagamento {
  id: string
  assinaturaId: string
  valor: number
  metodo: string
  status: string
  referenciaExterna: string
  createdAt: string
}

export interface GastoSistema {
  id: string
  tipo: 'dominio' | 'hospedagem' | 'anuncio' | 'salario' | 'ia' | 'ferramentas' | 'outros'
  descricao: string
  valor: number
  mes: number
  ano: number
  recorrente: boolean
  fornecedor: string
  observacao: string
  createdAt: string
}

export interface Investimento {
  id: string
  descricao: string
  valor: number
  data: string
  createdAt: string
}

export interface UsuarioSessao {
  colaboradorId: string
  empresaId: string
  empresaNome: string
  nome: string
  email: string
  papel: Papel
  tema?: string
  fotoUrl?: string
  username?: string
}

export interface Colaborador {
  id: string
  empresaId: string
  nome: string
  funcao: string
  email?: string
  cpf?: string
  papel: Papel
  liderImediatoId: string | null
  createdAt: string
  status?: 'ativo' | 'vago'
  fotoUrl?: string | null
}

export interface ColaboradorFormData {
  nome: string
  funcao: string
  liderImediatoId: string | null
}

export interface CriterioNota {
  criterio: string
  nota: number
}

export interface Avaliacao {
  id: string
  avaliadorId: string
  avaliadoId: string
  data: string
  criterios: CriterioNota[]
  comentarioGeral: string
}

export interface ScorecardIndicador {
  nome: string
  valor: number
  meta: number
  nota: number // 0-10
}

export interface ScorecardCategoria {
  nome: string
  peso: number // peso percentual (ex: 20 = 20%)
  nota: number // 0-10 (calculada automaticamente)
  indicadores: ScorecardIndicador[]
}

export interface Scorecard {
  categorias: ScorecardCategoria[]
  notaFinal: number // 0-10 (soma ponderada)
}

export interface MetricaMensal {
  id: string
  colaboradorId: string
  mes: number
  ano: number
  diasTrabalhados: number
  faltasInjustificadas: number
  horasAtraso: number
  observacao: string
  scorecard: Scorecard
  data: string
}

export interface Iniciativa {
  id: string
  colaboradorId: string
  titulo: string
  descricao: string
  resultado: string
  valorResultado: number
  unidadeMedida: string
  status: 'pendente' | 'aprovada' | 'recusada'
  data: string
}

export interface Projeto {
  id: string
  colaboradorId: string
  nome: string
  descricao: string
  status: 'em_andamento' | 'concluido' | 'pausado' | 'cancelado'
  dataInicio: string
  dataFim: string | null
  createdAt: string
  participantes?: ProjetoParticipante[]
}

export interface ProjetoParticipante {
  id: string
  projetoId: string
  colaboradorId: string
  responsabilidade: string
  peso: number // 1 a 5
  createdAt: string
  colaborador?: ColaboradorResumo
}

export interface ColaboradorResumo {
  id: string
  nome: string
  funcao: string
  fotoUrl: string | null
}

export interface Advertencia {
  id: string
  colaboradorId: string
  titulo: string
  descricao: string
  tipo: 'leve' | 'media' | 'grave'
  aplicadaPorId: string
  aplicadaPorNome?: string
  data: string
}

export interface Suspensao {
  id: string
  colaboradorId: string
  motivo: string
  dataInicio: string
  dataFim: string | null
  aplicadaPorId: string
  aplicadaPorNome?: string
  observacao: string
}

export const CRITERIOS_AVALIACAO = [
  'Qualidade do Trabalho',
  'Produtividade',
  'Trabalho em Equipe',
  'Pontualidade',
  'Comunicação',
  'Iniciativa',
] as const

// ---------- Simulação ----------

export type TipoImpacto = 'positivo' | 'negativo' | 'neutro'

export interface Impacto {
  id: string
  tipo: TipoImpacto
  titulo: string
  descricao: string
  colaboradorId?: string
  colaboradorNome?: string
  regraId?: string
}

export interface AcaoSimulacao {
  tipo: 'demissao' | 'promocao' | 'realocacao'
  colaboradorId: string
  descricao: string
  novoLiderId?: string | null
  novoCargo?: string
}

export interface EstadoSimulacao {
  ativa: boolean
  colaboradores: Colaborador[]
  acoes: AcaoSimulacao[]
  impactos: Impacto[]
}

export interface RegraImpacto {
  id: string
  nome: string
  descricao: string
  tipo: TipoImpacto
  condicao: RegraCondicao
  ativa: boolean
}

export interface RegraCondicao {
  tipo: 'time_sem_lider' | 'promocao_avaliacao_alta' | 'perda_lider_experiente' | 'promocao_sem_destaque' | 'lider_perfil_ruim' | 'subordinado_realocado' | 'time_ganha_lider_forte' | 'salto_hierarquico' | 'ex_colegas_subordinados' | 'cascata_excessiva'
  parametros?: Record<string, string | number>
}

export interface Cargo {
  id: string
  nome: string
}

// ─── Fit Cultural ──────────────────────────────────────
export interface FitCulturalPergunta {
  id: string
  pergunta: string
  dimensao: 'valores' | 'comportamento' | 'comunicacao' | 'lideranca' | 'inovacao'
  peso: number
  ativa: boolean
  ordem: number
}

export interface FitCulturalResposta {
  id: string
  colaboradorId: string
  perguntaId: string
  nota: number
  respondidoEm: string
}

// ─── DISC ───────────────────────────────────────────────
export interface PerguntaDISC {
  id: string
  pergunta: string
  dimensao: 'D' | 'I' | 'S' | 'C'
  peso: number
  ativa: boolean
}

export interface RespostaDISC {
  id: string
  colaboradorId: string
  perguntaId: string
  nota: number
  respondidoEm: string
}

export interface ResultadoDISC {
  id: string
  colaboradorId: string
  perfil: string
  pontuacaoD: number
  pontuacaoI: number
  pontuacaoS: number
  pontuacaoC: number
  data: string
}

// ─── Pesquisa de Sentimento ────────────────────────────
export interface PesquisaSentimento {
  id: string
  colaboradorId: string
  sentimento: 'muito_positivo' | 'positivo' | 'neutro' | 'negativo' | 'muito_negativo'
  nota: number
  engajamento?: number
  motivacao?: number
  pertencimento?: number
  comentario: string
  respondidoEm: string
}

// ─── Conversas ─────────────────────────────────────────
export interface Conversa {
  id: string
  colaboradorId: string
  tipo: '1:1' | 'feedback' | 'avaliacao' | 'alinhamento' | 'desligamento' | 'outro'
  titulo: string
  assunto: string
  resumo: string
  observacoes: string
  pontosPositivos: string
  pontosMelhoria: string
  realizadaEm: string
  registradaEm: string
  criadoPorId?: string
}

// ─── Testes Psicológicos ────────────────────────────────
export type TipoPerguntaTeste = 'multipla_escolha' | 'escala_1_5' | 'texto' | 'verdadeiro_falso' | 'escala_labeled'

export interface PerguntaTestePsicologico {
  id: string
  testeId: string
  pergunta: string
  tipo: TipoPerguntaTeste
  opcoes: string[] // for multipla_escolha
  peso: number
  ordem: number
  obrigatoria: boolean
}

export interface TestePsicologico {
  id: string
  titulo: string
  descricao: string
  instrucoes: string
  tipo: string
  criadoPorId: string | null
  criadoPorNome?: string
  ativo: boolean
  createdAt: string
  updatedAt: string
  perguntas?: PerguntaTestePsicologico[]
  empresasDisponiveis?: string[] // empresaIds
}

export interface EmpresaTesteDisponivel {
  id: string
  testeId: string
  empresaId: string
  empresaNome?: string
  ativo: boolean
  createdAt: string
}

// ─── Teste Atribuído (Gestão) ───────────────────────────
export interface TesteAtribuido {
  id: string
  testeId: string
  colaboradorId: string
  atribuidoPorId: string
  token: string
  status: 'pendente' | 'concluido'
  atribuidoEm: string
  respondidoEm: string | null
  // Relacionamentos (opcionais)
  testeTitulo?: string
  colaboradorNome?: string
  colaboradorFuncao?: string
  atribuidoPorNome?: string
}

// ─── Score Consolidado ──────────────────────────────────
export interface ScoreColaborador {
  id: string
  colaboradorId: string
  scoreGeral: number
  scoreFitCultural: number
  scoreDISC: number
  scoreSentimento: number
  scoreConversas: number
  scoreAvaliacoes: number
  scoreMetricas: number
  scoreIniciativas: number
  ultimaAtualizacao: string
}
