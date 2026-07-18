// ─── Multi-tenant ──────────────────────────────────
export enum Papel {
  ADMIN_PLATAFORMA = 'ADMIN_PLATAFORMA',
  CEO = 'CEO',
  GESTOR = 'GESTOR',
  RH = 'RH',
  COLABORADOR = 'COLABORADOR',
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

export interface UsuarioSessao {
  colaboradorId: string
  empresaId: string
  empresaNome: string
  nome: string
  email: string
  papel: Papel
}

export interface Colaborador {
  id: string
  empresaId: string
  nome: string
  funcao: string
  email?: string
  papel: Papel
  liderImediatoId: string | null
  createdAt: string
  status?: 'ativo' | 'vago'
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

export interface MetricaMensal {
  id: string
  colaboradorId: string
  mes: number
  ano: number
  diasTrabalhados: number
  faltasInjustificadas: number
  horasAtraso: number
  observacao: string
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
  data: string
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
