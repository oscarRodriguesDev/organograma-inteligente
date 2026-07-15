/**
 * Popula a lista inicial de cargos.
 * Executar: npx tsx scripts/popular-cargos.ts
 */
import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const CARGOS_INICIAIS = [
  'Chief Executive Officer (CEO)',
  'Diretor de Tecnologia (CTO)',
  'Diretor de Operações (COO)',
  'Diretor Comercial (CMO)',
  'Diretor Financeiro (CFO)',
  'Diretor de RH',
  'Gerente de Engenharia',
  'Gerente de Dados',
  'Gerente de Infraestrutura',
  'Gerente de Operações',
  'Gerente de Qualidade',
  'Gerente de Vendas',
  'Gerente de Marketing',
  'Gerente de Sucesso do Cliente',
  'Gerente Financeiro',
  'Gerente de Contabilidade',
  'Gerente de RH',
  'Coordenador de Projetos',
  'Coordenador de Qualidade',
  'Analista de TI',
  'Analista de Dados',
  'Analista Financeiro',
  'Analista de Marketing',
  'Analista de RH',
  'Analista de Vendas',
  'Analista de Suporte',
  'Analista de Operações',
  'Analista de Suprimentos',
  'Desenvolvedor Júnior',
  'Desenvolvedor Pleno',
  'Desenvolvedor Sênior',
  'Assistente Administrativo',
  'Assistente de RH',
  'Assistente Financeiro',
  'Designer',
  'Social Media',
  'Especialista de Produto',
]

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' })
  const prisma = new PrismaClient({ adapter })

  let count = 0
  for (const nome of CARGOS_INICIAIS) {
    await prisma.cargo.upsert({
      where: { nome },
      update: {},
      create: { nome },
    })
    count++
  }

  await prisma.$disconnect()
  console.log(`✅ ${count} cargos populados com sucesso!`)
}

main().catch(console.error)
