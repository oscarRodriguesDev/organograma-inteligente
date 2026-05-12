import { Colaborador } from './types'
import fs from 'node:fs'
import path from 'node:path'

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'colaboradores.json')

function readData(): Colaborador[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(raw) as Colaborador[]
  } catch {
    return []
  }
}

function writeData(data: Colaborador[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export function listarColaboradores(): Colaborador[] {
  return readData()
}

export function buscarColaborador(id: string): Colaborador | undefined {
  return readData().find((c) => c.id === id)
}

export function criarColaborador(
  dados: Omit<Colaborador, 'id' | 'createdAt'>
): Colaborador {
  const data = readData()
  const colaborador: Colaborador = {
    ...dados,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  data.push(colaborador)
  writeData(data)
  return colaborador
}

export function atualizarColaborador(
  id: string,
  dados: Partial<Omit<Colaborador, 'id' | 'createdAt'>>
): Colaborador | undefined {
  const data = readData()
  const idx = data.findIndex((c) => c.id === id)
  if (idx === -1) return undefined
  data[idx] = { ...data[idx], ...dados }
  writeData(data)
  return data[idx]
}

export function removerColaborador(id: string): boolean {
  const data = readData()
  const idx = data.findIndex((c) => c.id === id)
  if (idx === -1) return false
  data.splice(idx, 1)
  writeData(data)
  return true
}
