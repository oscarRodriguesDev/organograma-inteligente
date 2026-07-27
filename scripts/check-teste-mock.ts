import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' })
const prisma = new PrismaClient({ adapter })

async function main() {
  // 1. Mostrar empresas
  const empresas = await prisma.empresa.findMany({ select: { id: true, nome: true, slug: true } })
  console.log('=== EMPRESAS ===')
  for (const e of empresas) {
    console.log(`  - ${e.nome} (${e.slug}) [${e.id}]`)
  }

  // 2. Mostrar teste mock
  const teste = await prisma.testePsicologico.findFirst({
    where: { titulo: 'Perfil Comportamental - Mock' },
    include: { empresasDisponiveis: true },
  })

  if (!teste) {
    console.log('\n=== TESTE MOCK NÃO ENCONTRADO ===')
    console.log('Execute: npx tsx scripts/seed-teste-mock.ts')
  } else {
    console.log(`\n=== TESTE MOCK ===`)
    console.log(`  ID: ${teste.id}`)
    console.log(`  Título: ${teste.titulo}`)
    console.log(`  Ativo: ${teste.ativo}`)
    console.log(`  Empresas disponíveis:`)
    if (teste.empresasDisponiveis.length === 0) {
      console.log('    → NENHUMA (disponível para TODAS)')
    } else {
      for (const ed of teste.empresasDisponiveis) {
        const emp = empresas.find(e => e.id === ed.empresaId)
        console.log(`    → ${emp?.nome ?? ed.empresaId} (${ed.ativo ? 'ativo' : 'inativo'})`)
      }
    }
  }

  await prisma.$disconnect()
}

main().catch(e => { console.error('ERRO:', e); process.exit(1) })
