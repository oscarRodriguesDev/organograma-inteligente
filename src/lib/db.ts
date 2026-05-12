import { Colaborador, Avaliacao } from './types'
import fs from 'node:fs'
import path from 'node:path'

const COLABORADORES_FILE = path.join(process.cwd(), 'src', 'data', 'colaboradores.json')
const AVALIACOES_FILE = path.join(process.cwd(), 'src', 'data', 'avaliacoes.json')

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
