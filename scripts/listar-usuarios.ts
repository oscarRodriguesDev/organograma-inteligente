import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const users = await prisma.colaborador.findMany({
    where: {
      empresaId: { not: null },
      papel: { notIn: ['ADMIN_PLATAFORMA', 'ADMIN_SUPORTE', 'ADMIN_PSICH'] },
    },
    select: { id: true, nome: true, email: true, papel: true, status: true, empresa: { select: { nome: true } } },
    orderBy: { nome: 'asc' },
  })

  console.log('=== USUÁRIOS DAS EMPRESAS ===')
  for (const u of users) {
    console.log(`  ${u.nome} | ${u.email ?? 'sem email'} | papel: ${u.papel} | status: ${u.status} | empresa: ${u.empresa?.nome ?? 'N/A'}`)
  }
  console.log(`\nTotal: ${users.length} usuário(s)`)

  // Mostra admins também
  const admins = await prisma.colaborador.findMany({
    where: { papel: { in: ['ADMIN_PLATAFORMA', 'ADMIN_SUPORTE', 'ADMIN_PSICH'] } },
    select: { nome: true, email: true, papel: true },
  })
  if (admins.length > 0) {
    console.log('\n=== ADMINS ===')
    for (const a of admins) {
      console.log(`  ${a.nome} | ${a.email} | ${a.papel}`)
    }
  }

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
