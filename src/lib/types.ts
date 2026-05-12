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
