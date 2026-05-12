import { randomUUID } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DIR = join(import.meta.dirname, 'src', 'data')

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function pick(arr) { return arr[rand(0, arr.length - 1)] }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)) }

// ── Nomes ──
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

// ── Funções ──
const CARGOS = [
  'Analista de TI', 'Analista de Dados', 'Analista Financeiro',
  'Analista de Marketing', 'Analista de RH', 'Analista de Vendas',
  'Analista de Suporte', 'Analista de Operações', 'Analista de Suprimentos',
  'Desenvolvedor Júnior', 'Desenvolvedor Pleno', 'Desenvolvedor Sênior',
  'Assistente Administrativo', 'Assistente de RH', 'Assistente Financeiro',
  'Designer', 'Social Media', 'Especialista de Produto',
  'Coordenador de Projetos', 'Coordenador de Qualidade',
]

const AREAS = [
  { area: 'Tecnologia', cargos: ['Desenvolvedor Júnior', 'Desenvolvedor Pleno', 'Desenvolvedor Sênior', 'Analista de Dados', 'Analista de TI', 'Coordenador de Projetos'] },
  { area: 'Operações', cargos: ['Analista de Operações', 'Analista de Suprimentos', 'Coordenador de Qualidade', 'Assistente Administrativo'] },
  { area: 'Comercial', cargos: ['Analista de Vendas', 'Analista de Marketing', 'Analista de Suporte', 'Social Media', 'Designer'] },
  { area: 'Financeiro', cargos: ['Analista Financeiro', 'Assistente Financeiro', 'Especialista de Produto'] },
  { area: 'RH', cargos: ['Analista de RH', 'Assistente de RH'] },
]

// ── Estrutura hierárquica ──
const colaboradores = []
let idCounter = 0
function newId() { return (++idCounter).toString() }

// CEO
const ceoId = newId()
colaboradores.push({ id: ceoId, nome: 'Carlos Almeida', funcao: 'Chief Executive Officer (CEO)', liderImediatoId: null, createdAt: '2025-01-15T08:00:00.000Z' })

// Diretores
const diretores = [
  { nome: 'Roberta Mendes', funcao: 'Diretora de Tecnologia (CTO)' },
  { nome: 'Fernando Oliveira', funcao: 'Diretor de Operações (COO)' },
  { nome: 'Juliana Costa', funcao: 'Diretora Comercial (CMO)' },
  { nome: 'Marcos Pereira', funcao: 'Diretor Financeiro (CFO)' },
]
const diretoresIds = []
for (const d of diretores) {
  const id = newId()
  diretoresIds.push(id)
  colaboradores.push({ id, nome: d.nome, funcao: d.funcao, liderImediatoId: ceoId, createdAt: '2025-01-15T08:00:00.000Z' })
}

// Gerentes por área
const gerentes = [
  // Tecnologia
  { nome: 'Thiago Monteiro Castro', funcao: 'Gerente de Engenharia', area: 'Tecnologia', dirIdx: 0 },
  { nome: 'Camila Rocha Azevedo', funcao: 'Gerente de Dados', area: 'Tecnologia', dirIdx: 0 },
  { nome: 'Rafael Martins Carvalho', funcao: 'Gerente de Infraestrutura', area: 'Tecnologia', dirIdx: 0 },
  // Operações
  { nome: 'Diego Barbosa Ribeiro', funcao: 'Gerente de Operações', area: 'Operações', dirIdx: 1 },
  { nome: 'Amanda Rodrigues Silva', funcao: 'Gerente de Qualidade', area: 'Operações', dirIdx: 1 },
  // Comercial
  { nome: 'Pedro Henrique Lima', funcao: 'Gerente de Vendas', area: 'Comercial', dirIdx: 2 },
  { nome: 'Larissa Fernandes Gomes', funcao: 'Gerente de Marketing', area: 'Comercial', dirIdx: 2 },
  { nome: 'Felipe Cardoso Dias', funcao: 'Gerente de Sucesso do Cliente', area: 'Comercial', dirIdx: 2 },
  // Financeiro
  { nome: 'Lucas Gabriel Souza', funcao: 'Gerente Financeiro', area: 'Financeiro', dirIdx: 3 },
  { nome: 'Patrícia Moreira Campos', funcao: 'Gerente de Contabilidade', area: 'Financeiro', dirIdx: 3 },
]
const gerentesIds = []
for (const g of gerentes) {
  const id = newId()
  gerentesIds.push(id)
  colaboradores.push({ id, nome: g.nome, funcao: g.funcao, liderImediatoId: diretoresIds[g.dirIdx], createdAt: '2025-03-01T08:00:00.000Z' })
}

// Alocar colaboradores restantes sob gerentes
const nomesDisponiveis = nomes.slice(16)
const distribuirEm = (total, grupos) => {
  const result = new Array(grupos.length).fill(0)
  let resto = total
  for (let i = 0; i < grupos.length; i++) {
    const parte = Math.floor(total / grupos.length) + (i < total % grupos.length ? 1 : 0)
    result[i] = parte
    resto -= parte
  }
  return result
}

const cargosPorArea = (areaNome) => AREAS.find(a => a.area === areaNome).cargos
const quantidades = distribuirEm(nomesDisponiveis.length, gerentes)

let nomeIdx = 0
for (let g = 0; g < gerentes.length; g++) {
  const gerente = gerentes[g]
  const areaCargos = cargosPorArea(gerente.area)
  const qtd = quantidades[g]
  for (let i = 0; i < qtd && nomeIdx < nomesDisponiveis.length; i++) {
    const id = newId()
    const funcao = pick(areaCargos)
    colaboradores.push({
      id,
      nome: nomesDisponiveis[nomeIdx++],
      funcao,
      liderImediatoId: gerentesIds[g],
      createdAt: `2025-06-${String(rand(1, 15)).padStart(2, '0')}T08:00:00.000Z`,
    })
  }
}

// Preencher até 100 se faltar
while (colaboradores.length < 100 && nomeIdx < nomes.length) {
  const id = newId()
  const gerenteId = pick(gerentesIds)
  const gerente = gerentes[gerentesIds.indexOf(gerenteId)]
  const funcao = pick(cargosPorArea(gerente.area))
  colaboradores.push({
    id, nome: nomes[nomeIdx++], funcao,
    liderImediatoId: gerenteId,
    createdAt: `2025-07-${String(rand(1, 10)).padStart(2, '0')}T08:00:00.000Z`,
  })
}

console.log(`✓ ${colaboradores.length} colaboradores gerados`)

// ── Métricas (Jan/2026 e Fev/2026) ──
const metricas = []
const MESES = [1, 2]
for (const colaborador of colaboradores) {
  for (const mes of MESES) {
    const diasUteis = mes === 1 ? 22 : 20
    const isProblema = Math.random() < 0.15
    const metrica = {
      id: randomUUID(),
      colaboradorId: colaborador.id,
      mes,
      ano: 2026,
      diasTrabalhados: isProblema ? rand(12, diasUteis - 3) : rand(diasUteis - 3, diasUteis),
      faltasInjustificadas: isProblema ? rand(1, 5) : rand(0, 1),
      horasAtraso: isProblema ? rand(2, 12) : rand(0, 3),
      observacao: isProblema ? pick(['Atrasos recorrentes', 'Faltas sem justificativa', 'Problemas de pontualidade', '']) : '',
      data: `2026-${String(mes).padStart(2, '0')}-${String(rand(25, 28)).padStart(2, '0')}T18:00:00.000Z`,
    }
    metricas.push(metrica)
  }
}
console.log(`✓ ${metricas.length} métricas geradas`)

// ── Avaliações (líder→liderado, Jan e Fev 2026) ──
const CRITERIOS = [
  'Qualidade do Trabalho', 'Produtividade', 'Trabalho em Equipe',
  'Pontualidade', 'Comunicação', 'Iniciativa',
]
const avaliacoes = []
const mapa = Object.fromEntries(colaboradores.map(c => [c.id, c]))

for (const colaborador of colaboradores) {
  if (!colaborador.liderImediatoId) continue
  const lider = mapa[colaborador.liderImediatoId]
  if (!lider) continue

  for (const mes of MESES) {
    const notaBase = () => clamp(Math.round((rand(2, 5) + Math.random()) * 2) / 2, 1, 5)
    const criterios = CRITERIOS.map(c => ({ criterio: c, nota: notaBase() }))
    avaliacoes.push({
      id: randomUUID(),
      avaliadorId: colaborador.liderImediatoId,
      avaliadoId: colaborador.id,
      data: `2026-${String(mes).padStart(2, '0')}-${String(rand(20, 28)).padStart(2, '0')}T14:00:00.000Z`,
      criterios,
      comentarioGeral: pick([
        'Bom desempenho no período.', 'Entregas consistentes.',
        'Precisa melhorar pontualidade.', 'Ótimo trabalho em equipe.',
        'Demonstrou iniciativa nos projetos.', 'Resultados dentro do esperado.',
        'Superou as expectativas.', 'Precisa de mais foco nas entregas.',
        'Evoluiu bem desde a última avaliação.', '',
      ]),
    })
  }
}
console.log(`✓ ${avaliacoes.length} avaliações geradas`)

// ── Iniciativas ──
const TITULOS_INICIATIVAS = [
  'Automatização de relatório mensal', 'Criação de dashboard de vendas',
  'Otimização de processo de onboarding', 'Implementação de kanban na equipe',
  'Redução de custos com fornecedores', 'Campanha de marketing viral',
  'Nova integração com API de pagamentos', 'Refatoração do sistema legado',
  'Workshop de inovação para a equipe', 'Criação de base de conhecimento interna',
  'Melhoria no processo de suporte ao cliente', 'Automatização de testes',
  'Implementação de CI/CD', 'Otimização de consultas SQL',
  'Migração para nuvem', 'Programa de indicação de talentos',
  'Pesquisa de clima organizacional', 'Gamificação do treinamento',
  'Chatbot de atendimento', 'Sistema de ponto eletrônico',
  'App interno de comunicação', 'Curadoria de conteúdo para redes sociais',
  'Análise preditiva de churn', 'Reward system para equipe de vendas',
]

const RESULTADOS = [
  'Economia de 50h/mês em trabalho manual',
  'Aumento de 23% na produtividade da equipe',
  'Redução de R$ 12.000/mês em custos operacionais',
  'Melhoria de 35% no tempo de resposta ao cliente',
  'Ganho de eficiência de 40% no processo',
  'Redução de 60% nos erros de digitação',
  'Aumento de 15% na satisfação dos colaboradores',
  'Economia de R$ 8.000/mês com fornecedores',
  'Redução de 45min no tempo médio de atendimento',
  'Aumento de 28% nas vendas do trimestre',
]

const iniciativas = []
const qtdIniciativas = rand(25, 40)
for (let i = 0; i < qtdIniciativas; i++) {
  const col = pick(colaboradores)
  const titulo = pick(TITULOS_INICIATIVAS)
  const resultadoTexto = pick(RESULTADOS)
  const valor = rand(5, 200) * 100
  iniciativas.push({
    id: randomUUID(),
    colaboradorId: col.id,
    titulo,
    descricao: `Iniciativa proposta e executada pelo colaborador para melhoria contínua. ${resultadoTexto.toLowerCase()}.`,
    resultado: resultadoTexto,
    valorResultado: valor,
    unidadeMedida: pick(['R$/mês', 'R$ (único)', 'horas/mês', '%', 'pontos']),
    data: `2025-${String(rand(9, 12)).padStart(2, '0')}-${String(rand(1, 28)).padStart(2, '0')}T10:00:00.000Z`,
  })
}
console.log(`✓ ${iniciativas.length} iniciativas geradas`)

// ── Salvar ──
writeFileSync(join(DIR, 'colaboradores.json'), JSON.stringify(colaboradores, null, 2))
writeFileSync(join(DIR, 'metricas.json'), JSON.stringify(metricas, null, 2))
writeFileSync(join(DIR, 'avaliacoes.json'), JSON.stringify(avaliacoes, null, 2))
writeFileSync(join(DIR, 'iniciativas.json'), JSON.stringify(iniciativas, null, 2))

console.log('\n✅ Seed concluído!')
