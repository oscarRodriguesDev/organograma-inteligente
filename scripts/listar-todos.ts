import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const all = await prisma.colaborador.findMany({
    select: { nome: true, email: true, papel: true, username: true, status: true, empresaId: true },
    orderBy: { nome: 'asc' },
  })
  console.log('TODOS OS COLABORADORES:')
  for (const c of all) {
    console.log(`  ${c.nome.padEnd(25)} | email: ${(c.email ?? '---').padEnd(30)} | papel: ${(c.papel ?? '---').padEnd(18)} | user: ${(c.username ?? '---').padEnd(15)} | status: ${c.status} | empresaId: ${c.empresaId ?? 'null'}`)
  }
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
