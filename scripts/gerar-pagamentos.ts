/**
 * Gera pagamentos retroativos para assinaturas que não têm nenhum pagamento.
 * Uso: npx tsx scripts/gerar-pagamentos.ts
 */
import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL ?? ''
const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const assinaturas = await prisma.assinatura.findMany({
    include: { plano: true, pagamentos: true, empresa: true },
  })

  console.log(`Total de assinaturas: ${assinaturas.length}\n`)

  let gerados = 0

  for (const a of assinaturas) {
    if (a.pagamentos.length > 0) {
      console.log(`✔ ${a.empresa?.nome ?? '(sem nome)'} — ${a.pagamentos.length} pagamento(s) já existente(s)`)
      continue
    }

    const valor = a.ciclo === 'anual' ? a.plano?.precoAnual : a.plano?.precoMensal
    if (!valor || valor <= 0) {
      console.log(`⚠ ${a.empresa?.nome ?? '(sem nome)'} — plano gratuito ou sem preço (R$ ${valor}), pulando`)
      continue
    }

    await prisma.pagamento.create({
      data: {
        assinaturaId: a.id,
        valor,
        metodo: 'cartao_credito',
        status: 'aprovado',
        referenciaExterna: `MOCK-RETRO-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: a.dataInicio, // usa a data de início da assinatura
      },
    })

    console.log(`✅ ${a.empresa?.nome ?? '(sem nome)'} — Pagamento de R$ ${valor} gerado (data: ${a.dataInicio.toISOString().split('T')[0]})`)
    gerados++
  }

  console.log(`\nTotal: ${gerados} pagamento(s) gerado(s) retroativamente.`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('Erro:', e)
  process.exit(1)
})
