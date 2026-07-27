/**
 * Cria um teste psicológico mock no banco para teste do fluxo de gestão.
 * Executar: npx tsx scripts/seed-teste-mock.ts
 */
import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🧪 Criando teste psicológico mock...\n')

  // 1. Busca o admin_psich (ou cria um se não existir)
  let adminPsich = await prisma.colaborador.findFirst({
    where: { papel: 'ADMIN_PSICH' },
  })

  if (!adminPsich) {
    console.log('  ⚠ Nenhum ADMIN_PSICH encontrado. Criando um temporário...')
    adminPsich = await prisma.colaborador.create({
      data: {
        nome: 'Psicólogo Mock',
        funcao: 'Psicólogo da Plataforma',
        email: 'psich@mock.com',
        papel: 'ADMIN_PSICH',
        status: 'ativo',
        username: 'psich_mock',
      },
    })
    console.log('  ✓ ADMIN_PSICH mock criado')
  } else {
    console.log(`  ✓ ADMIN_PSICH encontrado: ${adminPsich.nome}`)
  }

  // 2. Busca empresa_default
  let empresa = await prisma.empresa.findFirst({
    where: { slug: 'empresa_default' },
  })

  if (!empresa) {
    // Se não tem empresa_default, pega a primeira empresa disponível
    empresa = await prisma.empresa.findFirst()
    if (!empresa) {
      console.error('❌ Nenhuma empresa encontrada no banco. Execute o seed principal primeiro.')
      await prisma.$disconnect()
      process.exit(1)
    }
    console.log(`  ⚠ Usando empresa: ${empresa.nome} (slug: ${empresa.slug})`)
  } else {
    console.log(`  ✓ Empresa encontrada: ${empresa.nome}`)
  }

  // 3. Verifica se já existe um teste mock
  const testeExistente = await prisma.testePsicologico.findFirst({
    where: { titulo: 'Perfil Comportamental - Mock' },
  })

  if (testeExistente) {
    console.log('  ⚠ Teste mock já existe. Removendo para recriar...')
    await prisma.testePsicologico.delete({ where: { id: testeExistente.id } })
    console.log('  ✓ Teste mock anterior removido')
  }

  // 4. Cria o teste com perguntas
  const teste = await prisma.testePsicologico.create({
    data: {
      titulo: 'Perfil Comportamental - Mock',
      descricao: 'Teste de perfil comportamental para avaliação de fit cultural e perfil DISC.',
      instrucoes: 'Responda cada pergunta de 1 a 5, onde 1 = Discordo totalmente e 5 = Concordo totalmente. Seja honesto em suas respostas.',
      tipo: 'comportamental',
      ativo: true,
      criadoPorId: adminPsich.id,
      perguntas: {
        create: [
          {
            pergunta: 'Eu gosto de trabalhar em equipe e colaborar com colegas',
            tipo: 'escala_1_5',
            peso: 1,
            ordem: 1,
            obrigatoria: true,
          },
          {
            pergunta: 'Eu me sinto confortável em assumir a liderança em projetos',
            tipo: 'escala_1_5',
            peso: 1,
            ordem: 2,
            obrigatoria: true,
          },
          {
            pergunta: 'Eu prefiro seguir processos e procedimentos estabelecidos',
            tipo: 'escala_1_5',
            peso: 1,
            ordem: 3,
            obrigatoria: true,
          },
          {
            pergunta: 'Eu busco ativamente por inovação e melhorias no trabalho',
            tipo: 'escala_1_5',
            peso: 1,
            ordem: 4,
            obrigatoria: true,
          },
          {
            pergunta: 'Eu lido bem com prazos apertados e pressão',
            tipo: 'escala_1_5',
            peso: 1,
            ordem: 5,
            obrigatoria: true,
          },
          {
            pergunta: 'Como você prefere resolver problemas?',
            tipo: 'multipla_escolha',
            opcoes: JSON.stringify(['Analisando dados', 'Discutindo com o time', 'Tentando soluções rápidas', 'Seguindo procedimentos']),
            peso: 1,
            ordem: 6,
            obrigatoria: true,
          },
          {
            pergunta: 'Você considera que tem boa comunicação interpessoal?',
            tipo: 'verdadeiro_falso',
            peso: 1,
            ordem: 7,
            obrigatoria: true,
          },
          {
            pergunta: 'Descreva brevemente seu estilo de trabalho ideal:',
            tipo: 'texto',
            peso: 1,
            ordem: 8,
            obrigatoria: false,
          },
        ],
      },
      empresasDisponiveis: {
        create: {
          empresaId: empresa.id,
          ativo: true,
        },
      },
    },
    include: {
      perguntas: true,
      empresasDisponiveis: true,
    },
  })

  console.log(`\n✅ Teste mock criado com sucesso!`)
  console.log(`   ID: ${teste.id}`)
  console.log(`   Título: ${teste.titulo}`)
  console.log(`   Perguntas: ${teste.perguntas.length}`)
  console.log(`   Disponível para: ${empresa.nome}`)
  console.log(`\n📋 Agora faça login como um gestor/CEO da empresa "${empresa.nome}"`)
  console.log(`   e acesse /gestao/testes para atribuir este teste aos colaboradores.`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('❌ Erro:', e)
  process.exit(1)
})
