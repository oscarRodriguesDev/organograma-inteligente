/**
 * Seed de planos de assinatura.
 * Uso: npx tsx scripts/seed-planos.ts
 */
import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL ?? ''
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const planos = [
    {
      nome: 'Básico',
      slug: 'basico',
      descricao: 'Para pequenas empresas que estão começando',
      precoMensal: 49.90,
      precoAnual: 499.00,
      maxColaboradores: 10,
      recursos: JSON.stringify(['Organograma básico', 'Até 10 colaboradores', 'Avaliações de desempenho', 'Métricas mensais']),
      destaque: false,
    },
    {
      nome: 'Profissional',
      slug: 'profissional',
      descricao: 'Para empresas em crescimento com equipes maiores',
      precoMensal: 99.90,
      precoAnual: 999.00,
      maxColaboradores: 50,
      recursos: JSON.stringify(['Organograma interativo', 'Até 50 colaboradores', 'Testes comportamentais (Fit Cultural + DISC)', 'Pesquisa de sentimento', 'Registro de conversas', 'Score consolidado', 'IA generativa']),
      destaque: true,
    },
    {
      nome: 'Enterprise',
      slug: 'enterprise',
      descricao: 'Para grandes empresas com necessidades avançadas',
      precoMensal: 199.90,
      precoAnual: 1999.00,
      maxColaboradores: -1, // ilimitado
      recursos: JSON.stringify(['Tudo do Profissional', 'Colaboradores ilimitados', 'Simulação de impacto', 'Múltiplos gestores', 'Suporte prioritário', 'Importação CSV', 'API de integração']),
      destaque: false,
    },
  ]

  for (const plano of planos) {
    await prisma.plano.upsert({
      where: { slug: plano.slug },
      update: plano,
      create: plano,
    })
    console.log(`✅ Plano "${plano.nome}" criado/atualizado`)
  }

  await prisma.$disconnect()
  console.log('\n🎉 Planos seed concluído!')
}

main()
