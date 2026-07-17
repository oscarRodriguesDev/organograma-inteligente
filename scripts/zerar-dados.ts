/**
 * Zera todos os dados do banco, mantendo apenas regras de impacto padrão.
 * Executar: npx tsx scripts/zerar-dados.ts
 */
import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL ?? ''
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function zerar() {
  console.log('🗑️  Zerando dados do banco...\n')

  // Ordem respeitando FK
  await prisma.impacto.deleteMany()
  console.log('  ✓ Impactos removidos')

  await prisma.iniciativa.deleteMany()
  console.log('  ✓ Iniciativas removidas')

  await prisma.metricaMensal.deleteMany()
  console.log('  ✓ Métricas removidas')

  await prisma.avaliacao.deleteMany()
  console.log('  ✓ Avaliações removidas')

  await prisma.regraImpacto.deleteMany()
  console.log('  ✓ Regras de impacto removidas')

  await prisma.colaborador.deleteMany()
  console.log('  ✓ Colaboradores removidos')

  // ── Regras de Impacto padrão ──
  const regras = [
    { nome: 'Time sem líder', descricao: 'Impacto negativo quando um time fica sem liderança direta.', tipo: 'negativo', condicao: JSON.stringify({ tipo: 'time_sem_lider' }), ativa: true },
    { nome: 'Promoção de alto desempenho', descricao: 'Impacto positivo quando um colaborador com alta avaliação é promovido.', tipo: 'positivo', condicao: JSON.stringify({ tipo: 'promocao_avaliacao_alta' }), ativa: true },
    { nome: 'Perda de liderança experiente', descricao: 'Impacto negativo quando um líder com boa avaliação sai.', tipo: 'negativo', condicao: JSON.stringify({ tipo: 'perda_lider_experiente' }), ativa: true },
    { nome: 'Promoção sem destaque', descricao: 'Impacto neutro quando um colaborador sem destaque é promovido por necessidade.', tipo: 'neutro', condicao: JSON.stringify({ tipo: 'promocao_sem_destaque' }), ativa: true },
    { nome: 'Líder com perfil inadequado', descricao: 'Impacto negativo quando um líder tem perfil Ruim.', tipo: 'negativo', condicao: JSON.stringify({ tipo: 'lider_perfil_ruim' }), ativa: true },
    { nome: 'Time ganha líder forte', descricao: 'Impacto positivo quando um time ganha um líder de alta performance.', tipo: 'positivo', condicao: JSON.stringify({ tipo: 'time_ganha_lider_forte' }), ativa: true },
  ]
  await prisma.regraImpacto.createMany({ data: regras.map(r => ({ ...r, empresaId: 'empresa_default' })) })
  console.log('  ✓ Regras de impacto recriadas (6 padrão)')

  await prisma.$disconnect()
  console.log('\n✅ Banco zerado! Agora cadastre o CEO e diretores pelo sistema.')
}

zerar().catch((e) => {
  console.error('❌ Erro:', e)
  process.exit(1)
})
