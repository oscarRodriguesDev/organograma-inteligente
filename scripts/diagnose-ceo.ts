import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('=== DIAGNÓSTICO: CEO e Testes ===\n')

  // 1. Busca CEOs e suas empresas
  const ceos = await prisma.colaborador.findMany({
    where: { papel: 'CEO', status: 'ativo' },
    include: { empresa: { select: { nome: true, slug: true, id: true } } },
  })

  if (ceos.length === 0) {
    console.log('❌ Nenhum CEO ativo encontrado no banco!')
  } else {
    console.log(`✅ ${ceos.length} CEO(s) encontrado(s):`)
    for (const c of ceos) {
      console.log(`   👤 ${c.nome} (${c.email ?? 'sem email'})`)
      console.log(`   🏢 Empresa: ${c.empresa?.nome ?? 'N/A'} (${c.empresa?.slug ?? 'N/A'})`)
      console.log(`   📧 Login: ${c.email ?? 'sem email'}`)
      console.log()
    }
  }

  // 2. Busca testes disponíveis globalmente (sem empresa vinculada)
  const globais = await prisma.testePsicologico.findMany({
    where: {
      ativo: true,
      empresasDisponiveis: { none: {} },
    },
    select: { id: true, titulo: true, tipo: true },
  })

  if (globais.length === 0) {
    console.log('❌ Nenhum teste global disponível')
  } else {
    console.log(`✅ ${globais.length} teste(s) global(is) disponível(is):`)
    for (const t of globais) {
      console.log(`   📝 ${t.titulo} (${t.tipo}) [${t.id}]`)
    }
  }

  await prisma.$disconnect()
}

main().catch(e => { console.error('❌ Erro:', e); process.exit(1) })
