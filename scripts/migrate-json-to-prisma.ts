/**
 * Migra os dados dos arquivos JSON para o PostgreSQL via Prisma.
 * Executar: npx tsx scripts/migrate-json-to-prisma.ts
 */
import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const connectionString = process.env.DATABASE_URL ?? ''
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const DATA_DIR = join(process.cwd(), 'src', 'data')

function lerJSON<T>(nome: string): T[] {
  try {
    return JSON.parse(readFileSync(join(DATA_DIR, nome), 'utf-8')) as T[]
  } catch {
    return []
  }
}

interface ColJSON {
  id: string
  nome: string
  funcao: string
  liderImediatoId: string | null
  createdAt: string
  status?: string
}

interface AvJSON {
  id: string
  avaliadorId: string
  avaliadoId: string
  data: string
  criterios: unknown
  comentarioGeral: string
}

interface MetricaJSON {
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

interface IniJSON {
  id: string
  colaboradorId: string
  titulo: string
  descricao: string
  resultado: string
  valorResultado: number
  unidadeMedida: string
  data: string
}

async function migrate() {
  console.log('🔄 Migrando dados JSON → SQLite...\n')

  // ── Colaboradores ──
  const colaboradores = lerJSON<ColJSON>('colaboradores.json')
  const colIds = new Set(colaboradores.map((c) => c.id))
  let colCount = 0
  if (colaboradores.length > 0) {
    const semLider = colaboradores.filter((c) => !c.liderImediatoId)
    const comLider = colaboradores.filter((c) => c.liderImediatoId)
    for (const c of [...semLider, ...comLider]) {
      try {
        await prisma.colaborador.upsert({
          where: { id: c.id },
          update: {
            nome: c.nome === 'VAGO' ? c.nome : c.nome,
            funcao: c.funcao,
            liderImediatoId: c.liderImediatoId && colIds.has(c.liderImediatoId) ? c.liderImediatoId : null,
            createdAt: new Date(c.createdAt || Date.now()),
            status: c.status || 'ativo',
          },
          create: {
            id: c.id,
            nome: c.nome,
            funcao: c.funcao,
            liderImediatoId: c.liderImediatoId && colIds.has(c.liderImediatoId) ? c.liderImediatoId : null,
            createdAt: new Date(c.createdAt || Date.now()),
            status: c.status || 'ativo',
          },
        })
        colCount++
      } catch {
        // ignora duplicatas
      }
    }
    console.log(`  ✓ ${colCount} colaboradores`)
  }

  // ── Avaliações ──
  const avaliacoes = lerJSON<AvJSON>('avaliacoes.json')
  let avCount = 0
  for (const a of avaliacoes) {
    if (!colIds.has(a.avaliadorId) || !colIds.has(a.avaliadoId)) continue
    try {
      await prisma.avaliacao.upsert({
        where: { id: a.id },
        update: {
          avaliadorId: a.avaliadorId,
          avaliadoId: a.avaliadoId,
          data: new Date(a.data),
          criterios: JSON.stringify(a.criterios),
          comentarioGeral: a.comentarioGeral || '',
        },
        create: {
          id: a.id,
          avaliadorId: a.avaliadorId,
          avaliadoId: a.avaliadoId,
          data: new Date(a.data),
          criterios: JSON.stringify(a.criterios),
          comentarioGeral: a.comentarioGeral || '',
        },
      })
      avCount++
    } catch {
      // ignora
    }
  }
  console.log(`  ✓ ${avCount} avaliações (${avaliacoes.length - avCount} ignoradas por FK inválida)`)

  // ── Métricas ──
  const metricas = lerJSON<MetricaJSON>('metricas.json')
  let metCount = 0
  for (const m of metricas) {
    if (!colIds.has(m.colaboradorId)) continue
    try {
      await prisma.metricaMensal.upsert({
        where: { id: m.id },
        update: {
          colaboradorId: m.colaboradorId,
          mes: m.mes,
          ano: m.ano,
          diasTrabalhados: m.diasTrabalhados,
          faltasInjustificadas: m.faltasInjustificadas,
          horasAtraso: m.horasAtraso,
          observacao: m.observacao || '',
          data: new Date(m.data),
        },
        create: {
          id: m.id,
          colaboradorId: m.colaboradorId,
          mes: m.mes,
          ano: m.ano,
          diasTrabalhados: m.diasTrabalhados,
          faltasInjustificadas: m.faltasInjustificadas,
          horasAtraso: m.horasAtraso,
          observacao: m.observacao || '',
          data: new Date(m.data),
        },
      })
      metCount++
    } catch {
      // ignora
    }
  }
  console.log(`  ✓ ${metCount} métricas (${metricas.length - metCount} ignoradas por FK inválida)`)

  // ── Iniciativas ──
  const iniciativas = lerJSON<IniJSON>('iniciativas.json')
  let iniCount = 0
  for (const i of iniciativas) {
    if (!colIds.has(i.colaboradorId)) continue
    try {
      await prisma.iniciativa.upsert({
        where: { id: i.id },
        update: {
          colaboradorId: i.colaboradorId,
          titulo: i.titulo,
          descricao: i.descricao || '',
          resultado: i.resultado || '',
          valorResultado: i.valorResultado || 0,
          unidadeMedida: i.unidadeMedida || '',
          data: new Date(i.data),
        },
        create: {
          id: i.id,
          colaboradorId: i.colaboradorId,
          titulo: i.titulo,
          descricao: i.descricao || '',
          resultado: i.resultado || '',
          valorResultado: i.valorResultado || 0,
          unidadeMedida: i.unidadeMedida || '',
          data: new Date(i.data),
        },
      })
      iniCount++
    } catch {
      // ignora
    }
  }
  console.log(`  ✓ ${iniCount} iniciativas (${iniciativas.length - iniCount} ignoradas por FK inválida)`)

  // ── Regras de Impacto ──
  const regras = lerJSON<any>('regras-impacto.json')
  let regCount = 0
  for (const r of regras) {
    try {
      await prisma.regraImpacto.upsert({
        where: { id: r.id },
        update: {
          nome: r.nome,
          descricao: r.descricao || '',
          tipo: r.tipo,
          condicao: JSON.stringify(r.condicao),
          ativa: r.ativa ?? true,
        },
        create: {
          id: r.id,
          nome: r.nome,
          descricao: r.descricao || '',
          tipo: r.tipo,
          condicao: JSON.stringify(r.condicao),
          ativa: r.ativa ?? true,
        },
      })
      regCount++
    } catch {
      // ignora
    }
  }
  console.log(`  ✓ ${regCount} regras de impacto`)

  await prisma.$disconnect()
  console.log('\n✅ Migração concluída!')
}

migrate().catch((e) => {
  console.error('❌ Erro na migração:', e)
  process.exit(1)
})
