export interface Colaborador {
  id: string
  nome: string
  funcao: string
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
  tipo: 'time_sem_lider' | 'promocao_avaliacao_alta' | 'perda_lider_experiente' | 'promocao_sem_destaque' | 'lider_perfil_ruim' | 'subordinado_realocado' | 'time_ganha_lider_forte'
  parametros?: Record<string, string | number>
}

export interface Cargo {
  id: string
  nome: string
}
