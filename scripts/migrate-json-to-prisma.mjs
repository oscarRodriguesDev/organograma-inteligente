/**
 * Migra os dados dos arquivos JSON para o SQLite via Prisma.
 * Executar: node scripts/migrate-json-to-prisma.mjs
 */
import { PrismaClient } from '../generated/prisma/client/index.js'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./dev.db',
})
const prisma = new PrismaClient({ adapter })

const DATA_DIR = join(__dirname, '..', 'src', 'data')

function lerJSON(nome) {
  try {
    return JSON.parse(readFileSync(join(DATA_DIR, nome), 'utf-8'))
  } catch {
    return []
  }
}

async function migrate() {
  console.log('🔄 Migrando dados JSON → SQLite...\n')

  // ── Colaboradores ──
  const colaboradores = lerJSON('colaboradores.json')
  if (colaboradores.length > 0) {
    // Inserir respeitando a ordem para evitar conflitos de FK
    // Primeiro os que não têm líder
    const semLider = colaboradores.filter((c) => !c.liderImediatoId)
    const comLider = colaboradores.filter((c) => c.liderImediatoId)

    for (const c of [...semLider, ...comLider]) {
      await prisma.colaborador.upsert({
        where: { id: c.id },
        update: {
          nome: c.nome,
          funcao: c.funcao,
          liderImediatoId: c.liderImediatoId,
          createdAt: new Date(c.createdAt),
          status: c.status || 'ativo',
        },
        create: {
          id: c.id,
          nome: c.nome,
          funcao: c.funcao,
          liderImediatoId: c.liderImediatoId,
          createdAt: new Date(c.createdAt),
          status: c.status || 'ativo',
        },
      })
    }
    console.log(`  ✓ ${colaboradores.length} colaboradores`)
  }

  // ── Avaliações ──
  const avaliacoes = lerJSON('avaliacoes.json')
  for (const a of avaliacoes) {
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
  }
  console.log(`  ✓ ${avaliacoes.length} avaliações`)

  // ── Métricas ──
  const metricas = lerJSON('metricas.json')
  for (const m of metricas) {
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
  }
  console.log(`  ✓ ${metricas.length} métricas`)

  // ── Iniciativas ──
  const iniciativas = lerJSON('iniciativas.json')
  for (const i of iniciativas) {
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
  }
  console.log(`  ✓ ${iniciativas.length} iniciativas`)

  // ── Regras de Impacto ──
  const regras = lerJSON('regras-impacto.json')
  for (const r of regras) {
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
  }
  console.log(`  ✓ ${regras.length} regras de impacto`)

  await prisma.$disconnect()
  console.log('\n✅ Migração concluída!')
}

migrate().catch((e) => {
  console.error('❌ Erro na migração:', e)
  process.exit(1)
})
