/**
 * Popula perguntas de teste (Fit Cultural e DISC) no banco.
 * Idempotente: limpa e recria as perguntas.
 * Executar: npx tsx scripts/seed-testes.ts
 */
import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' })
const prisma = new PrismaClient({ adapter })

const PERGUNTAS_FIT_CULTURAL = [
  // Dimensão: valores
  { pergunta: 'Eu me identifico com os valores e propósito da empresa', dimensao: 'valores', peso: 2, ordem: 1 },
  { pergunta: 'Minhas crenças pessoais estão alinhadas com a cultura da organização', dimensao: 'valores', peso: 2, ordem: 2 },
  // Dimensão: comportamento
  { pergunta: 'Eu prefiro trabalhar em um ambiente estruturado com regras claras', dimensao: 'comportamento', peso: 1, ordem: 3 },
  { pergunta: 'Eu me adapto facilmente a mudanças e novos processos', dimensao: 'comportamento', peso: 1, ordem: 4 },
  // Dimensão: comunicacao
  { pergunta: 'Eu me sinto confortável em dar e receber feedbacks', dimensao: 'comunicacao', peso: 2, ordem: 5 },
  { pergunta: 'Eu colaboro bem com equipes multidisciplinares', dimensao: 'comunicacao', peso: 1, ordem: 6 },
  // Dimensão: lideranca
  { pergunta: 'Eu tenho facilidade em influenciar e motivar outras pessoas', dimensao: 'lideranca', peso: 2, ordem: 7 },
  { pergunta: 'Eu assumo responsabilidade por resultados do time', dimensao: 'lideranca', peso: 2, ordem: 8 },
  // Dimensão: inovacao
  { pergunta: 'Eu busco ativamente por melhorias e novas soluções', dimensao: 'inovacao', peso: 1, ordem: 9 },
  { pergunta: 'Eu estou disposto a experimentar abordagens diferentes', dimensao: 'inovacao', peso: 1, ordem: 10 },
]

const PERGUNTAS_DISC = [
  // Dimensão D (Dominância)
  { pergunta: 'Eu gosto de assumir o controle de situações', dimensao: 'D', peso: 1 },
  { pergunta: 'Eu sou direto e objetivo ao me comunicar', dimensao: 'D', peso: 1 },
  { pergunta: 'Eu busco resultados rápidos e concretos', dimensao: 'D', peso: 1 },
  { pergunta: 'Eu não tenho medo de conflitos quando necessário', dimensao: 'D', peso: 1 },
  // Dimensão I (Influência)
  { pergunta: 'Eu gosto de interagir e conhecer novas pessoas', dimensao: 'I', peso: 1 },
  { pergunta: 'Eu sou otimista e entusiasmado com novas ideias', dimensao: 'I', peso: 1 },
  { pergunta: 'Eu tenho facilidade para persuadir os outros', dimensao: 'I', peso: 1 },
  { pergunta: 'Eu gosto de trabalhar em equipe e colaborar', dimensao: 'I', peso: 1 },
  // Dimensão S (Estabilidade)
  { pergunta: 'Eu valorizo consistência e previsibilidade no trabalho', dimensao: 'S', peso: 1 },
  { pergunta: 'Eu sou paciente e ouço atentamente os outros', dimensao: 'S', peso: 1 },
  { pergunta: 'Eu prefiro mudanças planejadas e graduais', dimensao: 'S', peso: 1 },
  { pergunta: 'Eu sou leal e comprometido com minha equipe', dimensao: 'S', peso: 1 },
  // Dimensão C (Conformidade)
  { pergunta: 'Eu sigo regras e procedimentos estabelecidos', dimensao: 'C', peso: 1 },
  { pergunta: 'Eu sou detalhista e busco precisão no que faço', dimensao: 'C', peso: 1 },
  { pergunta: 'Eu analiso dados antes de tomar decisões', dimensao: 'C', peso: 1 },
  { pergunta: 'Eu valorizo qualidade e conformidade acima de velocidade', dimensao: 'C', peso: 1 },
]

async function main() {
  console.log('🌱 Populando perguntas de teste...\n')

  // ── Fit Cultural ──
  await prisma.fitCulturalPergunta.deleteMany()
  console.log('  ✓ Perguntas Fit Cultural anteriores removidas')

  let countFC = 0
  for (const p of PERGUNTAS_FIT_CULTURAL) {
    await prisma.fitCulturalPergunta.create({
      data: {
        pergunta: p.pergunta,
        dimensao: p.dimensao,
        peso: p.peso,
        ordem: p.ordem,
        ativa: true,
        empresaId: 'empresa_default',
      },
    })
    countFC++
  }
  console.log(`  ✓ ${countFC} perguntas Fit Cultural criadas`)

  // ── DISC ──
  await prisma.perguntaDISC.deleteMany()
  console.log('  ✓ Perguntas DISC anteriores removidas')

  let countDISC = 0
  for (const p of PERGUNTAS_DISC) {
    await prisma.perguntaDISC.create({
      data: {
        pergunta: p.pergunta,
        dimensao: p.dimensao,
        peso: p.peso,
        ativa: true,
        empresaId: 'empresa_default',
      },
    })
    countDISC++
  }
  console.log(`  ✓ ${countDISC} perguntas DISC criadas`)

  await prisma.$disconnect()
  console.log(`\n✅ Seed concluído! ${countFC + countDISC} perguntas no total.`)
}

main().catch((e) => {
  console.error('❌ Erro:', e)
  process.exit(1)
})
