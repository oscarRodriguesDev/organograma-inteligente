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
import { prisma } from './prisma'
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
  const regra = await criarRegraImpacto({ nome, descricao, tipo, condicao, ativa: true })
  revalidatePath('/regras-impacto')
  return regra
}

export async function atualizarRegraImpactoAction(
  id: string,
  dados: Partial<Omit<RegraImpacto, 'id'>>
) {
  const regra = await atualizarRegraImpacto(id, dados)
  revalidatePath('/regras-impacto')
  return regra
}

export async function removerRegraImpactoAction(id: string) {
  await removerRegraImpacto(id)
  revalidatePath('/regras-impacto')
}

export async function getDadosSimulacao() {
  const [avaliacoes, metricas, regras, scoresPrisma] = await Promise.all([
    listarAvaliacoes(),
    listarMetricas(),
    listarRegrasImpacto(),
    prisma.scoreColaborador.findMany(),
  ])

  // Converte scores para Record<string, ScoreColaborador>
  const scores: Record<string, any> = {}
  for (const s of scoresPrisma) {
    scores[s.colaboradorId] = {
      id: s.id,
      colaboradorId: s.colaboradorId,
      scoreGeral: s.scoreGeral,
      scoreFitCultural: s.scoreFitCultural,
      scoreDISC: s.scoreDISC,
      scoreSentimento: s.scoreSentimento,
      scoreConversas: s.scoreConversas,
      scoreAvaliacoes: s.scoreAvaliacoes,
      scoreMetricas: s.scoreMetricas,
      scoreIniciativas: s.scoreIniciativas,
      ultimaAtualizacao: s.ultimaAtualizacao.toISOString(),
    }
  }

  return { avaliacoes, metricas, regras, scores }
}

export async function salvarImpactosAction(impactos: Impacto[]) {
  await salvarImpactosSimulacao(impactos)
}

export async function carregarImpactosAction(): Promise<Impacto[]> {
  return carregarImpactosSimulacao()
}

export async function limparImpactosAction() {
  await limparImpactosSimulacao()
}
