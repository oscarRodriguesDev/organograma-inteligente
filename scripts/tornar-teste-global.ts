import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const teste = await prisma.testePsicologico.findFirst({
    where: { titulo: 'Perfil Comportamental - Mock' },
  })

  if (!teste) {
    console.log('❌ Teste mock não encontrado. Execute scripts/seed-teste-mock.ts primeiro.')
    await prisma.$disconnect()
    return
  }

  // Remove todas as restrições de empresa → teste fica disponível para TODAS
  const { count } = await prisma.empresaTesteDisponivel.deleteMany({
    where: { testeId: teste.id },
  })

  console.log(`✅ Teste "${teste.titulo}" agora está disponível para TODAS as empresas!`)
  console.log(`   ${count} vínculo(s) de empresa removido(s).`)
  console.log(`\n📋 Faça login como CEO/Gestor de qualquer empresa e acesse /gestao/testes`)

  await prisma.$disconnect()
}

main().catch(e => { console.error('❌ Erro:', e); process.exit(1) })
