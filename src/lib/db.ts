import { Colaborador, Avaliacao, Iniciativa, MetricaMensal, RegraImpacto, Impacto } from './types'
import fs from 'node:fs'
import path from 'node:path'

const COLABORADORES_FILE = path.join(process.cwd(), 'src', 'data', 'colaboradores.json')
const AVALIACOES_FILE = path.join(process.cwd(), 'src', 'data', 'avaliacoes.json')
const INICIATIVAS_FILE = path.join(process.cwd(), 'src', 'data', 'iniciativas.json')
const METRICAS_FILE = path.join(process.cwd(), 'src', 'data', 'metricas.json')

function lerColaboradores(): Colaborador[] {
  try {
    const raw = fs.readFileSync(COLABORADORES_FILE, 'utf-8')
    return JSON.parse(raw) as Colaborador[]
  } catch {
    return []
  }
}

function escreverColaboradores(data: Colaborador[]): void {
  fs.writeFileSync(COLABORADORES_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

function lerAvaliacoes(): Avaliacao[] {
  try {
    const raw = fs.readFileSync(AVALIACOES_FILE, 'utf-8')
    return JSON.parse(raw) as Avaliacao[]
  } catch {
    return []
  }
}

function escreverAvaliacoes(data: Avaliacao[]): void {
  fs.writeFileSync(AVALIACOES_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

function lerIniciativas(): Iniciativa[] {
  try {
    const raw = fs.readFileSync(INICIATIVAS_FILE, 'utf-8')
    return JSON.parse(raw) as Iniciativa[]
  } catch {
    return []
  }
}

function escreverIniciativas(data: Iniciativa[]): void {
  fs.writeFileSync(INICIATIVAS_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

function lerMetricas(): MetricaMensal[] {
  try {
    const raw = fs.readFileSync(METRICAS_FILE, 'utf-8')
    return JSON.parse(raw) as MetricaMensal[]
  } catch {
    return []
  }
}

function escreverMetricas(data: MetricaMensal[]): void {
  fs.writeFileSync(METRICAS_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export function listarColaboradores(): Colaborador[] {
  return lerColaboradores()
}

export function buscarColaborador(id: string): Colaborador | undefined {
  return lerColaboradores().find((c) => c.id === id)
}

export function criarColaborador(
  dados: Omit<Colaborador, 'id' | 'createdAt'>
): Colaborador {
  const data = lerColaboradores()
  const colaborador: Colaborador = {
    ...dados,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  data.push(colaborador)
  escreverColaboradores(data)
  return colaborador
}

export function atualizarColaborador(
  id: string,
  dados: Partial<Omit<Colaborador, 'id' | 'createdAt'>>
): Colaborador | undefined {
  const data = lerColaboradores()
  const idx = data.findIndex((c) => c.id === id)
  if (idx === -1) return undefined
  data[idx] = { ...data[idx], ...dados }
  escreverColaboradores(data)
  return data[idx]
}

export function removerColaborador(id: string): boolean {
  const data = lerColaboradores()
  const idx = data.findIndex((c) => c.id === id)
  if (idx === -1) return false
  data.splice(idx, 1)
  escreverColaboradores(data)
  return true
}

export function listarAvaliacoes(): Avaliacao[] {
  return lerAvaliacoes()
}

export function buscarAvaliacao(id: string): Avaliacao | undefined {
  return lerAvaliacoes().find((a) => a.id === id)
}

export function criarAvaliacao(
  dados: Omit<Avaliacao, 'id' | 'data'>
): Avaliacao {
  const data = lerAvaliacoes()
  const avaliacao: Avaliacao = {
    ...dados,
    id: crypto.randomUUID(),
    data: new Date().toISOString(),
  }
  data.push(avaliacao)
  escreverAvaliacoes(data)
  return avaliacao
}

export function removerAvaliacao(id: string): boolean {
  const data = lerAvaliacoes()
  const idx = data.findIndex((a) => a.id === id)
  if (idx === -1) return false
  data.splice(idx, 1)
  escreverAvaliacoes(data)
  return true
}

export function listarAvaliacoesPorAvaliador(avaliadorId: string): Avaliacao[] {
  return lerAvaliacoes().filter((a) => a.avaliadorId === avaliadorId)
}

export function listarAvaliacoesPorAvaliado(avaliadoId: string): Avaliacao[] {
  return lerAvaliacoes().filter((a) => a.avaliadoId === avaliadoId)
}

export function listarIniciativas(): Iniciativa[] {
  return lerIniciativas()
}

export function criarIniciativa(
  dados: Omit<Iniciativa, 'id' | 'data'>
): Iniciativa {
  const data = lerIniciativas()
  const iniciativa: Iniciativa = {
    ...dados,
    id: crypto.randomUUID(),
    data: new Date().toISOString(),
  }
  data.push(iniciativa)
  escreverIniciativas(data)
  return iniciativa
}

export function removerIniciativa(id: string): boolean {
  const data = lerIniciativas()
  const idx = data.findIndex((i) => i.id === id)
  if (idx === -1) return false
  data.splice(idx, 1)
  escreverIniciativas(data)
  return true
}

export function listarIniciativasPorColaborador(colaboradorId: string): Iniciativa[] {
  return lerIniciativas().filter((i) => i.colaboradorId === colaboradorId)
}

export function listarMetricas(): MetricaMensal[] {
  return lerMetricas()
}

export function criarMetrica(
  dados: Omit<MetricaMensal, 'id' | 'data'>
): MetricaMensal {
  const data = lerMetricas()
  const metrica: MetricaMensal = {
    ...dados,
    id: crypto.randomUUID(),
    data: new Date().toISOString(),
  }
  data.push(metrica)
  escreverMetricas(data)
  return metrica
}

export function removerMetrica(id: string): boolean {
  const data = lerMetricas()
  const idx = data.findIndex((m) => m.id === id)
  if (idx === -1) return false
  data.splice(idx, 1)
  escreverMetricas(data)
  return true
}

export function listarMetricasPorColaborador(colaboradorId: string): MetricaMensal[] {
  return lerMetricas().filter((m) => m.colaboradorId === colaboradorId)
}

// ---------- Regras de Impacto ----------

const REGRAS_FILE = path.join(process.cwd(), 'src', 'data', 'regras-impacto.json')

function lerRegras(): RegraImpacto[] {
  try {
    const raw = fs.readFileSync(REGRAS_FILE, 'utf-8')
    return JSON.parse(raw) as RegraImpacto[]
  } catch {
    return []
  }
}

function escreverRegras(data: RegraImpacto[]): void {
  fs.writeFileSync(REGRAS_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export function listarRegrasImpacto(): RegraImpacto[] {
  return lerRegras()
}

export function criarRegraImpacto(dados: Omit<RegraImpacto, 'id'>): RegraImpacto {
  const data = lerRegras()
  const regra: RegraImpacto = {
    ...dados,
    id: crypto.randomUUID(),
  }
  data.push(regra)
  escreverRegras(data)
  return regra
}

export function atualizarRegraImpacto(id: string, dados: Partial<Omit<RegraImpacto, 'id'>>): RegraImpacto | undefined {
  const data = lerRegras()
  const idx = data.findIndex((r) => r.id === id)
  if (idx === -1) return undefined
  data[idx] = { ...data[idx], ...dados }
  escreverRegras(data)
  return data[idx]
}

export function removerRegraImpacto(id: string): boolean {
  const data = lerRegras()
  const idx = data.findIndex((r) => r.id === id)
  if (idx === -1) return false
  data.splice(idx, 1)
  escreverRegras(data)
  return true
}

// ---------- Histórico de Impactos ----------

const IMPACTOS_FILE = path.join(process.cwd(), 'src', 'data', 'impactos.json')

function lerImpactosSalvos(): Impacto[] {
  try {
    const raw = fs.readFileSync(IMPACTOS_FILE, 'utf-8')
    return JSON.parse(raw) as Impacto[]
  } catch {
    return []
  }
}

function escreverImpactosSalvos(data: Impacto[]): void {
  fs.writeFileSync(IMPACTOS_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export function salvarImpactosSimulacao(impactos: Impacto[]): void {
  escreverImpactosSalvos(impactos)
}

export function carregarImpactosSimulacao(): Impacto[] {
  return lerImpactosSalvos()
}

export function limparImpactosSimulacao(): void {
  escreverImpactosSalvos([])
}
