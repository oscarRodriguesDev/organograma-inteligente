'use server'

import { revalidatePath } from 'next/cache'
import {
  listarRegrasImpacto,
  criarRegraImpacto,
  atualizarRegraImpacto,
  removerRegraImpacto,
  listarAvaliacoes,
  listarMetricas,
  salvarImpactosSimulacao,
  carregarImpactosSimulacao,
  limparImpactosSimulacao,
} from './db'
import type { RegraImpacto, TipoImpacto, RegraCondicao, Impacto } from './types'

export async function listarRegrasImpactoAction() {
  return listarRegrasImpacto()
}

export async function criarRegraImpactoAction(
  nome: string,
  descricao: string,
  tipo: TipoImpacto,
  condicao: RegraCondicao
) {
  const regra = criarRegraImpacto({ nome, descricao, tipo, condicao, ativa: true })
  revalidatePath('/regras-impacto')
  return regra
}

export async function atualizarRegraImpactoAction(
  id: string,
  dados: Partial<Omit<RegraImpacto, 'id'>>
) {
  const regra = atualizarRegraImpacto(id, dados)
  revalidatePath('/regras-impacto')
  return regra
}

export async function removerRegraImpactoAction(id: string) {
  removerRegraImpacto(id)
  revalidatePath('/regras-impacto')
}

export async function getDadosSimulacao() {
  const avaliacoes = listarAvaliacoes()
  const metricas = listarMetricas()
  const regras = listarRegrasImpacto()
  return { avaliacoes, metricas, regras }
}

export async function salvarImpactosAction(impactos: Impacto[]) {
  salvarImpactosSimulacao(impactos)
}

export async function carregarImpactosAction(): Promise<Impacto[]> {
  return carregarImpactosSimulacao()
}

export async function limparImpactosAction() {
  limparImpactosSimulacao()
}
