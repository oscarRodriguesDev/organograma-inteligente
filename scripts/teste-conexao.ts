import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

async function main() {
  console.log('Conectando ao Supabase...')
  
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' })
  const prisma = new PrismaClient({ adapter })

  // Verifica conexão
  await prisma.$connect()
  console.log('Conectado!\n')

  // Cria CEO
  const ceo = await prisma.colaborador.create({
    data: { nome: 'Carlos Almeida', funcao: 'CEO', empresaId: 'empresa_default' }
  })
  console.log('CEO criado:', ceo.nome, '|', ceo.id)

  // Cria CTO
  const cto = await prisma.colaborador.create({
    data: { nome: 'Roberta Mendes', funcao: 'CTO', liderImediatoId: ceo.id, empresaId: 'empresa_default' }
  })
  console.log('CTO criado:', cto.nome)

  // Lista
  const todos = await prisma.colaborador.findMany()
  console.log(`\nTotal no banco: ${todos.length}`)
  for (const c of todos) {
    console.log(`  - ${c.nome} (${c.funcao})`)
  }

  await prisma.$disconnect()
  console.log('\nConcluído! Dados salvos no Supabase.')
}

main().catch(e => {
  console.error('ERRO:', e.message)
  process.exit(1)
})
