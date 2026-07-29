/**
 * Seed do banco de dados via Prisma.
 * Executar: npm run seed
 */
import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL ?? ''
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }
function pick<T>(arr: T[]): T { return arr[rand(0, arr.length - 1)] }
function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)) }

const nomes = [
  'Ana Beatriz Oliveira', 'Carlos Eduardo Santos', 'Maria Fernanda Costa',
  'Pedro Henrique Lima', 'Amanda Rodrigues Silva', 'Lucas Gabriel Souza',
  'Juliana Almeida Pereira', 'Rafael Martins Carvalho', 'Larissa Fernandes Gomes',
  'Diego Barbosa Ribeiro', 'Camila Rocha Azevedo', 'Thiago Monteiro Castro',
  'Vanessa Nunes Correia', 'Felipe Cardoso Dias', 'Patrícia Moreira Campos',
  'Bruno Teixeira Neves', 'Letícia Mendes Faria', 'Gustavo Vieira Lopes',
  'Tatiana Freitas Barros', 'Eduardo Araújo Pinto', 'Renata Duarte Vasconcelos',
  'André Cavalcanti Rezende', 'Cristina Melo Peixoto', 'Marcelo Nogueira Bastos',
  'Débora Assis Santana', 'Leandro Pires Siqueira', 'Fernanda Moura Toledo',
  'Alexandre Lemos Cordeiro', 'Priscila Brito Matos', 'Jorge Tavares Bueno',
  'Bianca Dantas Marques', 'Vinicius Campos Xavier', 'Érica Figueiredo Braga',
  'Rodrigo Fonseca Viana', 'Aline Porto Gusmão', 'Henrique Salgado Maia',
  'Carolina Valente Ramalho', 'Leonardo Quadros Rosa', 'Michele Sardinha Cruz',
  'Ricardo Amorim Gouveia', 'Daniela Barreto Veiga', 'Otávio Toledo Bastos',
  'Thaís Beltrão Muniz', 'William Estrada Caldeira', 'Gabriela Madeira Arantes',
  'Márcio Amorim Bacelar', 'Sandra Lamego Mattos', 'Frederico Vilaça Padilha',
  'Jéssica Bittencourt Prado', 'Nelson Cezar Furtado', 'Roberta Miranda Câmara',
  'Adriano Campelo Guedes', 'Luciana Domingues Baião', 'Sérgio Castilho Valle',
  'Marina Caymmi Estrela', 'Cícero Gravataí Morais', 'Elaine Carneiro Gentil',
  'João Pedro Sales Vilar', 'Viviane Capistrano Lago', 'Artur Damasceno Villa',
  'Carla Mourão Gramado', 'Gilberto Paranhos Godói', 'Suzana Arruda Caiado',
  'Flávio Bugre Pimenta', 'Maitê Bragança Peres', 'César Madureira Brandão',
  'Solange Caiçara Granja', 'Humberto Anhanguera Porto', 'Taís Ibiapina Rosa',
  'Joaquim Pitangui Sales', 'Zuleica Paraguaçu Goulart', 'Nilson Japurá Matta',
  'Sônia Piraquê Sampaio', 'Rogério Ubaíra Falcão', 'Helena Pitanga Noronha',
  'Mauro Caeté Miranda', 'Cláudia Jurubeba Lins', 'Vitor Grajaú Seixas',
  'Lorena Ipanema Quadros', 'Josué Mamoré Lobato', 'Januária Potengi Gusmão',
  'Benício Caravelas Azevedo', 'Iara Galvão Leme', 'Tadeu Botelho Ferraz',
  'Adélia Rebouças Salazar', 'Davi Pindorama Siqueira', 'Isabela Curitiba Sabará',
  'Emanuel Tietê Menezes', 'Fabiana Araguaia Capistrano', 'Ruy Parima Ourique',
  'Hortência Xopotó Perdigão', 'Saulo Paraupaba Estácio', 'Rosana Pitombas Rosa',
  'Natan Tupã Pinheiro', 'Giovana Peruíbe Quadros', 'Elias Mogi Cruzeiro',
  'Tereza Jundiaí Valadares', 'Ícaro Pajeú Maranhão', 'Mônica Taquari Neves',
]

const AREAS = [
  { area: 'Tecnologia', cargos: ['Desenvolvedor Júnior', 'Desenvolvedor Pleno', 'Desenvolvedor Sênior', 'Analista de Dados', 'Analista de TI', 'Coordenador de Projetos'] },
  { area: 'Operações', cargos: ['Analista de Operações', 'Analista de Suprimentos', 'Coordenador de Qualidade', 'Assistente Administrativo'] },
  { area: 'Comercial', cargos: ['Analista de Vendas', 'Analista de Marketing', 'Analista de Suporte', 'Social Media', 'Designer'] },
  { area: 'Financeiro', cargos: ['Analista Financeiro', 'Assistente Financeiro', 'Especialista de Produto'] },
  { area: 'RH', cargos: ['Analista de RH', 'Assistente de RH'] },
]

const CRITERIOS_AVALIACAO = [
  'Qualidade do Trabalho', 'Produtividade', 'Trabalho em Equipe',
  'Pontualidade', 'Comunicação', 'Iniciativa',
]

async function seed() {
  console.log('🌱 Iniciando seed...\n')

  // Limpa dados existentes
  await prisma.impacto.deleteMany()
  await prisma.regraImpacto.deleteMany()
  await prisma.iniciativa.deleteMany()
  await prisma.metricaMensal.deleteMany()
  await prisma.avaliacao.deleteMany()
  await prisma.colaborador.deleteMany()
  await prisma.fitCulturalPergunta.deleteMany()
  await prisma.perguntaDISC.deleteMany()
  await prisma.cargo.deleteMany()

  // ── Empresa Default (tenant) ──
  await prisma.empresa.upsert({
    where: { slug: 'empresa-default' },
    update: {},
    create: {
      id: 'empresa_default',
      nome: 'Empresa Default',
      slug: 'empresa-default',
      cargos: {
        create: [
          { nome: 'CEO' },
          { nome: 'DIRETOR' },
          { nome: 'GERENTE' },
          { nome: 'SUPERVISOR' },
          { nome: 'GESTOR' },
          { nome: 'LIDER' },
          { nome: 'OPERACIONAL' },
        ],
      },
    },
  })

  // ── Estrutura hierárquica ──
  // Helper para gerar CPFs fictícios (apenas para seed)
  let cpfCounter = 10000000000
  const gerarCPF = () => {
    const n = (++cpfCounter).toString()
    return n.slice(0, 11)
  }

  const cols: { id: string; nome: string; funcao: string; cpf?: string; email?: string; senhaHash?: string; liderImediatoId: string | null; empresaId: string; createdAt: Date }[] = []
  let idCounter = 0
  const newId = () => (++idCounter).toString()

  // CEO
  const ceoId = newId()
  cols.push({ id: ceoId, nome: 'Carlos Almeida', funcao: 'Chief Executive Officer (CEO)', cpf: gerarCPF(), empresaId: 'empresa_default', liderImediatoId: null, createdAt: new Date('2025-01-15T08:00:00.000Z') })

  // Diretores
  const diretores = [
    { nome: 'Roberta Mendes', funcao: 'Diretora de Tecnologia (CTO)' },
    { nome: 'Fernando Oliveira', funcao: 'Diretor de Operações (COO)' },
    { nome: 'Juliana Costa', funcao: 'Diretora Comercial (CMO)' },
    { nome: 'Marcos Pereira', funcao: 'Diretor Financeiro (CFO)' },
  ]
  const diretoresIds: string[] = []
  for (const d of diretores) {
    const id = newId()
    diretoresIds.push(id)
    cols.push({ id, nome: d.nome, funcao: d.funcao, cpf: gerarCPF(), empresaId: 'empresa_default', liderImediatoId: ceoId, createdAt: new Date('2025-01-15T08:00:00.000Z') })
  }

  // Gerentes
  const gerentes = [
    { nome: 'Thiago Monteiro Castro', funcao: 'Gerente de Engenharia', area: 'Tecnologia', dirIdx: 0 },
    { nome: 'Camila Rocha Azevedo', funcao: 'Gerente de Dados', area: 'Tecnologia', dirIdx: 0 },
    { nome: 'Rafael Martins Carvalho', funcao: 'Gerente de Infraestrutura', area: 'Tecnologia', dirIdx: 0 },
    { nome: 'Diego Barbosa Ribeiro', funcao: 'Gerente de Operações', area: 'Operações', dirIdx: 1 },
    { nome: 'Amanda Rodrigues Silva', funcao: 'Gerente de Qualidade', area: 'Operações', dirIdx: 1 },
    { nome: 'Pedro Henrique Lima', funcao: 'Gerente de Vendas', area: 'Comercial', dirIdx: 2 },
    { nome: 'Larissa Fernandes Gomes', funcao: 'Gerente de Marketing', area: 'Comercial', dirIdx: 2 },
    { nome: 'Felipe Cardoso Dias', funcao: 'Gerente de Sucesso do Cliente', area: 'Comercial', dirIdx: 2 },
    { nome: 'Lucas Gabriel Souza', funcao: 'Gerente Financeiro', area: 'Financeiro', dirIdx: 3 },
    { nome: 'Patrícia Moreira Campos', funcao: 'Gerente de Contabilidade', area: 'Financeiro', dirIdx: 3 },
  ]
  const gerentesIds: string[] = []
  for (const g of gerentes) {
    const id = newId()
    gerentesIds.push(id)
    cols.push({ id, nome: g.nome, funcao: g.funcao, cpf: gerarCPF(), empresaId: 'empresa_default', liderImediatoId: diretoresIds[g.dirIdx], createdAt: new Date('2025-03-01T08:00:00.000Z') })
  }

  // Analistas
  const nomesDisponiveis = [...nomes]
  const cargosPorArea = (areaNome: string) => AREAS.find(a => a.area === areaNome)!.cargos

  let nomeIdx = 0
  for (let g = 0; g < gerentes.length; g++) {
    const gerente = gerentes[g]
    const areaCargos = cargosPorArea(gerente.area)
    const qtd = Math.floor((nomesDisponiveis.length - 16) / gerentes.length) + (g < (nomesDisponiveis.length - 16) % gerentes.length ? 1 : 0)
    for (let i = 0; i < qtd && nomeIdx < nomesDisponiveis.length; i++) {
      const id = newId()
      cols.push({
        id, nome: nomesDisponiveis[nomeIdx++],
        funcao: pick(areaCargos),
        cpf: gerarCPF(),
        empresaId: 'empresa_default',
        liderImediatoId: gerentesIds[g],
        createdAt: new Date(`2025-06-${String(rand(1, 15)).padStart(2, '0')}T08:00:00.000Z`),
      })
    }
  }

  // Inserir colaboradores
  for (const c of cols) {
    await prisma.colaborador.create({ data: c })
  }
  console.log(`  ✓ ${cols.length} colaboradores`)

  const mapa = Object.fromEntries(cols.map(c => [c.id, c]))

  // ── Métricas (2 meses) ──
  const metricas: any[] = []
  for (const col of cols) {
    for (const mes of [1, 2]) {
      const diasUteis = mes === 1 ? 22 : 20
      const isProblema = Math.random() < 0.15
      metricas.push({
        colaboradorId: col.id, mes, ano: 2026,
        diasTrabalhados: isProblema ? rand(12, diasUteis - 3) : rand(diasUteis - 3, diasUteis),
        faltasInjustificadas: isProblema ? rand(1, 5) : rand(0, 1),
        horasAtraso: isProblema ? rand(2, 12) : rand(0, 3),
        observacao: isProblema ? pick(['Atrasos recorrentes', 'Faltas sem justificativa', 'Problemas de pontualidade', '']) : '',
      })
    }
  }
  await prisma.metricaMensal.createMany({ data: metricas })
  console.log(`  ✓ ${metricas.length} métricas`)

  // ── Avaliações ──
  const avaliacoes: any[] = []
  for (const col of cols) {
    if (!col.liderImediatoId) continue
    const lider = mapa[col.liderImediatoId]
    if (!lider) continue
    for (const mes of [1, 2]) {
      const notaBase = () => clamp(Math.round((rand(2, 5) + Math.random()) * 2) / 2, 1, 5)
      const criterios = CRITERIOS_AVALIACAO.map(c => ({ criterio: c, nota: notaBase() }))
      avaliacoes.push({
        avaliadorId: col.liderImediatoId,
        avaliadoId: col.id,
        criterios: JSON.stringify(criterios),
        comentarioGeral: pick(['Bom desempenho no período.', 'Entregas consistentes.', 'Precisa melhorar pontualidade.', 'Ótimo trabalho em equipe.', 'Demonstrou iniciativa nos projetos.', 'Resultados dentro do esperado.', 'Superou as expectativas.', 'Precisa de mais foco nas entregas.', 'Evoluiu bem desde a última avaliação.', '']),
      })
    }
  }
  await prisma.avaliacao.createMany({ data: avaliacoes })
  console.log(`  ✓ ${avaliacoes.length} avaliações`)

  // ── Iniciativas ──
  const TITULOS = ['Automatização de relatório mensal', 'Criação de dashboard de vendas', 'Otimização de processo de onboarding', 'Implementação de kanban na equipe', 'Redução de custos com fornecedores', 'Campanha de marketing viral', 'Nova integração com API de pagamentos', 'Refatoração do sistema legado', 'Workshop de inovação para a equipe', 'Criação de base de conhecimento interna', 'Melhoria no processo de suporte ao cliente', 'Automatização de testes', 'Implementação de CI/CD', 'Otimização de consultas SQL', 'Migração para nuvem', 'Programa de indicação de talentos', 'Pesquisa de clima organizacional', 'Gamificação do treinamento', 'Chatbot de atendimento', 'Sistema de ponto eletrônico', 'App interno de comunicação', 'Curadoria de conteúdo para redes sociais', 'Análise preditiva de churn', 'Reward system para equipe de vendas']
  const RESULTADOS = ['Economia de 50h/mês em trabalho manual', 'Aumento de 23% na produtividade da equipe', 'Redução de R$ 12.000/mês em custos operacionais', 'Melhoria de 35% no tempo de resposta ao cliente', 'Ganho de eficiência de 40% no processo', 'Redução de 60% nos erros de digitação', 'Aumento de 15% na satisfação dos colaboradores', 'Economia de R$ 8.000/mês com fornecedores', 'Redução de 45min no tempo médio de atendimento', 'Aumento de 28% nas vendas do trimestre']
  const iniciativas: any[] = []
  for (let i = 0; i < rand(25, 40); i++) {
    const col = pick(cols)
    const resultadoTexto = pick(RESULTADOS)
    iniciativas.push({
      colaboradorId: col.id, titulo: pick(TITULOS),
      descricao: `Iniciativa proposta e executada pelo colaborador para melhoria contínua. ${resultadoTexto.toLowerCase()}.`,
      resultado: resultadoTexto, valorResultado: rand(5, 200) * 100,
      unidadeMedida: pick(['R$/mês', 'R$ (único)', 'horas/mês', '%', 'pontos']),
    })
  }
  await prisma.iniciativa.createMany({ data: iniciativas })
  console.log(`  ✓ ${iniciativas.length} iniciativas`)

  // ── Regras de Impacto ──
  const regras = [
    { nome: 'Time sem líder', descricao: 'Impacto negativo quando um time fica sem liderança direta.', tipo: 'negativo', condicao: JSON.stringify({ tipo: 'time_sem_lider' }), ativa: true },
    { nome: 'Promoção de alto desempenho', descricao: 'Impacto positivo quando um colaborador com alta avaliação é promovido.', tipo: 'positivo', condicao: JSON.stringify({ tipo: 'promocao_avaliacao_alta' }), ativa: true },
    { nome: 'Perda de liderança experiente', descricao: 'Impacto negativo quando um líder com boa avaliação sai.', tipo: 'negativo', condicao: JSON.stringify({ tipo: 'perda_lider_experiente' }), ativa: true },
    { nome: 'Promoção sem destaque', descricao: 'Impacto neutro quando um colaborador sem destaque é promovido por necessidade.', tipo: 'neutro', condicao: JSON.stringify({ tipo: 'promocao_sem_destaque' }), ativa: true },
    { nome: 'Líder com perfil inadequado', descricao: 'Impacto negativo quando um líder tem perfil Ruim.', tipo: 'negativo', condicao: JSON.stringify({ tipo: 'lider_perfil_ruim' }), ativa: true },
    { nome: 'Time ganha líder forte', descricao: 'Impacto positivo quando um time ganha um líder de alta performance.', tipo: 'positivo', condicao: JSON.stringify({ tipo: 'time_ganha_lider_forte' }), ativa: true },
  ]
  await prisma.regraImpacto.createMany({ data: regras.map(r => ({ ...r, empresaId: 'empresa_default' })) })
  console.log(`  ✓ ${regras.length} regras de impacto`)

  await prisma.$disconnect()
  console.log('\n✅ Seed concluído!')
}

seed().catch((e) => {
  console.error('❌ Erro no seed:', e)
  process.exit(1)
})
