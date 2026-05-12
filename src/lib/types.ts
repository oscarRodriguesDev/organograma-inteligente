export interface Colaborador {
  id: string
  nome: string
  funcao: string
  liderImediatoId: string | null
  createdAt: string
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

export const CRITERIOS_AVALIACAO = [
  'Qualidade do Trabalho',
  'Produtividade',
  'Trabalho em Equipe',
  'Pontualidade',
  'Comunicação',
  'Iniciativa',
] as const
