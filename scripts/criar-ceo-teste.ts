import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('=== CRIAR CEO DE TESTE ===\n')

  // Busca primeira empresa disponível
  const empresa = await prisma.empresa.findFirst()
  if (!empresa) {
    console.log('❌ Nenhuma empresa encontrada!')
    await prisma.$disconnect()
    return
  }

  const email = 'ceo@teste.com'
  const senha = '123456'

  // Remove CEO anterior com mesmo email se existir
  const existente = await prisma.colaborador.findFirst({
    where: { email, papel: 'CEO' },
  })
  if (existente) {
    await prisma.colaborador.delete({ where: { id: existente.id } })
    console.log('  ✓ CEO anterior removido')
  }

  const senhaHash = await bcrypt.hash(senha, 10)

  const ceo = await prisma.colaborador.create({
    data: {
      empresaId: empresa.id,
      nome: 'CEO de Teste',
      funcao: 'CEO',
      email,
      papel: 'CEO',
      status: 'ativo',
      username: 'ceo_teste',
      senhaHash,
    },
  })

  console.log(`✅ CEO criado com sucesso!`)
  console.log(`   Empresa: ${empresa.nome} (${empresa.slug})`)
  console.log(`   Email: ${email}`)
  console.log(`   Senha: ${senha}`)
  console.log(`   Papel: CEO`)
  console.log(`\n📋 Faça login com:`)
  console.log(`   Email: ${email}`)
  console.log(`   Senha: ${senha}`)
  console.log(`\n   Depois acesse /gestao/testes`)

  await prisma.$disconnect()
}

main().catch(e => { console.error('❌ Erro:', e); process.exit(1) })
