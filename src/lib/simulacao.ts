import type { Colaborador, Avaliacao, MetricaMensal, Impacto, AcaoSimulacao, RegraImpacto, TipoImpacto } from './types'

let impactoIdCounter = 0
function genImpactoId(): string {
  return `imp_${++impactoIdCounter}_${Date.now()}`
}

// ---------- utils ----------

function obterSubordinados(colaboradores: Colaborador[], id: string): Colaborador[] {
  return colaboradores.filter((c) => c.liderImediatoId === id)
}

function obterLider(colaboradores: Colaborador[], id: string): Colaborador | undefined {
  const col = colaboradores.find((c) => c.id === id)
  if (!col || !col.liderImediatoId) return undefined
  return colaboradores.find((c) => c.id === col.liderImediatoId)
}

function mediaAvaliacoes(avaliacoes: Avaliacao[], colaboradorId: string): number {
  const notas = avaliacoes
    .filter((a) => a.avaliadoId === colaboradorId)
    .flatMap((a) => a.criterios.map((c) => c.nota))
  if (notas.length === 0) return 0
  return notas.reduce((s, n) => s + n, 0) / notas.length
}

function perfilColaborador(metricas: MetricaMensal[], colaboradorId: string): 'Bom' | 'Ruim' | 'desconhecido' {
  const metas = metricas.filter((m) => m.colaboradorId === colaboradorId)
  if (metas.length === 0) return 'desconhecido'
  const ultima = metas.reduce((a, b) => (a.ano > b.ano || (a.ano === b.ano && a.mes > b.mes) ? a : b))
  if (ultima.faltasInjustificadas > 2 || ultima.horasAtraso > 4) return 'Ruim'
  return 'Bom'
}

// ---------- Sugestão de candidatos ----------

export interface CandidatoSugerido {
  colaborador: Colaborador
  mediaAvaliacoes: number
  perfil: string
  score: number
}

export function sugerirCandidatos(
  colaboradores: Colaborador[],
  avaliacoes: Avaliacao[],
  metricas: MetricaMensal[],
  liderVagoId: string
): CandidatoSugerido[] {
  const subordinados = obterSubordinados(colaboradores, liderVagoId)
    .filter((c) => c.id !== liderVagoId)

  return subordinados
    .map((col) => {
      const media = mediaAvaliacoes(avaliacoes, col.id)
      const perfil = perfilColaborador(metricas, col.id)
      const scoreMedia = media * 2
      const scorePerfil = perfil === 'Bom' ? 1.5 : perfil === 'Ruim' ? -1 : 0
      const scoreSubordinados = obterSubordinados(colaboradores, col.id).length * 0.5
      return {
        colaborador: col,
        mediaAvaliacoes: media,
        perfil,
        score: scoreMedia + scorePerfil + scoreSubordinados,
      }
    })
    .sort((a, b) => b.score - a.score)
}

// ---------- Processar ações ----------

export interface ResultadoSimulacao {
  colaboradores: Colaborador[]
  impactos: Impacto[]
}

function criarImpacto(
  tipo: TipoImpacto,
  titulo: string,
  descricao: string,
  colaboradorId?: string,
  colaboradorNome?: string,
  regraId?: string
): Impacto {
  return {
    id: genImpactoId(),
    tipo,
    titulo,
    descricao,
    colaboradorId,
    colaboradorNome,
    regraId,
  }
}

function calcularImpactos(
  originais: Colaborador[],
  simulados: Colaborador[],
  avaliacoes: Avaliacao[],
  metricas: MetricaMensal[],
  regras: RegraImpacto[],
  acao: AcaoSimulacao
): Impacto[] {
  const impactos: Impacto[] = []

  const colAlvo = originais.find((c) => c.id === acao.colaboradorId)
  if (!colAlvo) return impactos

  if (acao.tipo === 'demissao') {
    const subordinados = obterSubordinados(originais, colAlvo.id)
    const lider = obterLider(originais, colAlvo.id)

    if (subordinados.length > 0) {
      impactos.push(
        criarImpacto(
          'negativo',
          'Time ficou sem líder direto',
          `${colAlvo.nome} liderava ${subordinados.length} pessoa(s) que agora respondem a ${lider?.nome || 'ninguém (órfãos)'}`,
          colAlvo.id,
          colAlvo.nome,
          'time_sem_lider'
        )
      )

      for (const sub of subordinados) {
        const media = mediaAvaliacoes(avaliacoes, sub.id)
        if (media >= 4) {
          impactos.push(
            criarImpacto(
              'negativo',
              'Colaborador perdeu liderança direta',
              `${sub.nome} (avaliação ${media.toFixed(1)}) perdeu ${colAlvo.nome} como líder direto`,
              sub.id,
              sub.nome,
              'perda_lider_experiente'
            )
          )
        }
      }
    }

    const perfilLider = perfilColaborador(metricas, colAlvo.id)
    if (perfilLider === 'Bom') {
      impactos.push(
        criarImpacto(
          'negativo',
          'Saída de liderança de alto desempenho',
          `${colAlvo.nome} tinha perfil Bom e avaliações positivas — sua saída impacta a equipe`,
          colAlvo.id,
          colAlvo.nome,
          'perda_lider_experiente'
        )
      )
    } else if (perfilLider === 'Ruim') {
      impactos.push(
        criarImpacto(
          'positivo',
          'Substituto pode melhorar o time',
          `${colAlvo.nome} tinha perfil Ruim — a saída pode ser oportunidade para o time`,
          colAlvo.id,
          colAlvo.nome
        )
      )
    }
  }

  if (acao.tipo === 'promocao') {
    const novoLider = simulados.find((c) => c.id === acao.colaboradorId)
    const promovido = originais.find((c) => c.id === acao.colaboradorId)
    if (!novoLider || !promovido) return impactos

    const media = mediaAvaliacoes(avaliacoes, promovido.id)
    const perfil = perfilColaborador(metricas, promovido.id)

    if (media >= 4.5) {
      impactos.push(
        criarImpacto(
          'positivo',
          'Promoção merecida — alta performance',
          `${promovido.nome} (avaliação ${media.toFixed(1)}) foi promovido — excelente histórico`,
          promovido.id,
          promovido.nome,
          'promocao_avaliacao_alta'
        )
      )
    } else if (media >= 3.5) {
      impactos.push(
        criarImpacto(
          'positivo',
          'Promoção por crescimento',
          `${promovido.nome} (avaliação ${media.toFixed(1)}) foi promovido — bom potencial`,
          promovido.id,
          promovido.nome
        )
      )
    } else {
      impactos.push(
        criarImpacto(
          'neutro',
          'Promoção por necessidade',
          `${promovido.nome} (avaliação ${media.toFixed(1)}) foi promovido — sem histórico de destaque`,
          promovido.id,
          promovido.nome,
          'promocao_sem_destaque'
        )
      )
    }

    if (perfil === 'Ruim') {
      impactos.push(
        criarImpacto(
          'negativo',
          'Perfil inadequado para liderança',
          `${promovido.nome} tem perfil Ruim — pode impactar negativamente o time`,
          promovido.id,
          promovido.nome,
          'lider_perfil_ruim'
        )
      )
    }

    const antigosSubordinados = originais.filter((c) => c.liderImediatoId === promovido.id)
    if (antigosSubordinados.length > 0) {
      const novoLiderDeles = simulados.find((c) => c.liderImediatoId === promovido.id)
        ? originais.find((c) => c.id === promovido.liderImediatoId)
        : null

      impactos.push(
        criarImpacto(
          'negativo',
          `Time de ${promovido.nome} fica sem liderança direta`,
          `${antigosSubordinados.length} subordinado(s) de ${promovido.nome} precisam de novo líder`,
          promovido.id,
          promovido.nome
        )
      )
    }
  }

  const regrasAtivas = regras.filter((r) => r.ativa)
  for (const regra of regrasAtivas) {
    const impactoRegra = aplicarRegraCustomizada(regra, originais, simulados, avaliacoes, metricas)
    if (impactoRegra) {
      impactos.push(impactoRegra)
    }
  }

  return impactos
}

function aplicarRegraCustomizada(
  regra: RegraImpacto,
  originais: Colaborador[],
  simulados: Colaborador[],
  avaliacoes: Avaliacao[],
  metricas: MetricaMensal[]
): Impacto | null {
  switch (regra.condicao.tipo) {
    case 'time_sem_lider': {
      const semLider = simulados.filter(
        (c) => c.liderImediatoId && !simulados.some((s) => s.id === c.liderImediatoId)
      )
      if (semLider.length > 0) {
        return criarImpacto(
          regra.tipo,
          regra.nome,
          `${semLider.length} colaborador(es) sem líder`,
          undefined,
          undefined,
          regra.id
        )
      }
      return null
    }
    case 'time_ganha_lider_forte': {
      for (const col of simulados) {
        const antigo = originais.find((c) => c.id === col.id)
        if (antigo && col.liderImediatoId !== antigo.liderImediatoId) {
          const novoLider = simulados.find((c) => c.id === col.liderImediatoId)
          if (novoLider) {
            const media = mediaAvaliacoes(avaliacoes, novoLider.id)
            if (media >= 4.5) {
              return criarImpacto(
                'positivo',
                regra.nome,
                `${col.nome} agora responde a ${novoLider.nome} (avaliação ${media.toFixed(1)})`,
                col.id,
                col.nome,
                regra.id
              )
            }
          }
        }
      }
      return null
    }
    default:
      return null
  }
}

export function processarAcao(
  estadoAtual: Colaborador[],
  acao: AcaoSimulacao,
  colaboradorPromovidoId: string | null,
  avaliacoes: Avaliacao[],
  metricas: MetricaMensal[],
  regras: RegraImpacto[]
): ResultadoSimulacao {
  const colaboradores = [...estadoAtual.map((c) => ({ ...c }))]
  const impactos: Impacto[] = []

  const colAlvo = colaboradores.find((c) => c.id === acao.colaboradorId)
  if (!colAlvo) return { colaboradores, impactos }

  if (acao.tipo === 'demissao') {
    const subordinados = obterSubordinados(colaboradores, colAlvo.id)
    const liderId = colAlvo.liderImediatoId

    // Transfere subordinados para o líder do demitido
    for (const sub of subordinados) {
      sub.liderImediatoId = liderId
    }

    // Marca como vago em vez de remover
    colAlvo.status = 'vago'
    colAlvo.nome = 'VAGO'
    colAlvo.liderImediatoId = liderId
  }

  if (acao.tipo === 'realocacao') {
    const colAlvo = colaboradores.find((c) => c.id === acao.colaboradorId)
    if (!colAlvo) return { colaboradores, impactos }
    const antigoLiderId = colAlvo.liderImediatoId
    colAlvo.liderImediatoId = acao.novoLiderId ?? null
    colAlvo.status = 'ativo'
    if (colAlvo.liderImediatoId === null) {
      for (const c of colaboradores) {
        if (c.liderImediatoId === null && c.id !== colAlvo.id && c.status !== 'vago') {
          c.liderImediatoId = colAlvo.id
        }
      }
    }
  }

  if (acao.tipo === 'promocao') {
    if (colaboradorPromovidoId) {
      // Preencher cargo vago com um candidato (existente ou novo)
      const promovido = colaboradores.find((c) => c.id === colaboradorPromovidoId)
      if (!promovido) return { colaboradores, impactos }

      const cargoVago = colaboradores.find((c) => c.id === acao.colaboradorId)
      if (!cargoVago) return { colaboradores, impactos }

      const promovidoAntigoLiderId = promovido.liderImediatoId
      const promovidoSubordinados = obterSubordinados(colaboradores, promovido.id)

      // Cria VAGO na posição antiga do promovido (cascata)
      const vagoPromovido: Colaborador = {
        id: `vago_${promovido.id}`,
        nome: 'VAGO',
        funcao: promovido.funcao,
        liderImediatoId: promovidoAntigoLiderId,
        createdAt: promovido.createdAt,
        status: 'vago',
      }
      colaboradores.push(vagoPromovido)

      // Subordinados do promovido passam a responder ao VAGO na posição antiga
      for (const sub of promovidoSubordinados) {
        sub.liderImediatoId = vagoPromovido.id
      }

      // Promovido assume o cargo vago
      promovido.liderImediatoId = cargoVago.liderImediatoId
      promovido.funcao = cargoVago.funcao
      promovido.status = 'ativo'

      // Se o cargo vago era o topo (CEO), transfere todos os órfãos para o novo CEO
      if (cargoVago.liderImediatoId === null) {
        for (const c of colaboradores) {
          if (c.liderImediatoId === null && c.id !== promovido.id && c.status !== 'vago') {
            c.liderImediatoId = promovido.id
          }
        }
      }

      // Remove o nó vago original
      const idx = colaboradores.findIndex((c) => c.id === cargoVago.id)
      if (idx !== -1) colaboradores.splice(idx, 1)
    } else {
      // Promoção direta: escolhe novo líder e cargo
      const promovido = colaboradores.find((c) => c.id === acao.colaboradorId)
      if (!promovido) return { colaboradores, impactos }

      const antigoLiderId = promovido.liderImediatoId
      const subordinados = obterSubordinados(colaboradores, promovido.id)

      // Cria um nó vago no lugar do promovido
      const vago: Colaborador = {
        id: `vago_${promovido.id}`,
        nome: 'VAGO',
        funcao: promovido.funcao,
        liderImediatoId: antigoLiderId,
        createdAt: promovido.createdAt,
        status: 'vago',
      }
      colaboradores.push(vago)

      // Transfere subordinados do promovido para o novo vago
      for (const sub of subordinados) {
        sub.liderImediatoId = vago.id
      }

      if (acao.novoLiderId === null) {
        // Promovido ao topo (CEO): substitui o CEO atual
        const ceoAtual = colaboradores.find((c) => c.liderImediatoId === null && c.id !== promovido.id)
        if (ceoAtual) {
          const subordinadosCeo = obterSubordinados(colaboradores, ceoAtual.id)
          // Transfere TODOS os subordinados do CEO para o promovido
          for (const sub of subordinadosCeo) {
            sub.liderImediatoId = promovido.id
          }
          // Remove o CEO atual
          const idxCeo = colaboradores.findIndex((c) => c.id === ceoAtual.id)
          if (idxCeo !== -1) colaboradores.splice(idxCeo, 1)
        }
      }

      promovido.liderImediatoId = acao.novoLiderId ?? null
      if (acao.novoCargo) promovido.funcao = acao.novoCargo
      promovido.status = 'ativo'
    }
  }

  const novosImpactos = calcularImpactos(estadoAtual, colaboradores, avaliacoes, metricas, regras, acao)
  impactos.push(...novosImpactos)

  return { colaboradores, impactos }
}

export function calcularImpactosSimulacao(
  originais: Colaborador[],
  simulados: Colaborador[],
  acoes: AcaoSimulacao[],
  avaliacoes: Avaliacao[],
  metricas: MetricaMensal[],
  regras: RegraImpacto[]
): Impacto[] {
  const todosImpactos: Impacto[] = []

  for (const acao of acoes) {
    const impactos = calcularImpactos(originais, simulados, avaliacoes, metricas, regras, acao)
    todosImpactos.push(...impactos)
  }

  return todosImpactos
}

// ---------- Análise de estado (impactos em tempo real) ----------

/**
 * Analisa o estado atual simulado vs original e gera impactos com base
 * nas condições presentes AGORA. Isso permite que impactos sejam
 * resolvidos em tempo real quando o usuário toma ações corretivas.
 */
export function analisarEstadoSimulacao(
  originais: Colaborador[],
  simulados: Colaborador[],
  avaliacoes: Avaliacao[],
  metricas: MetricaMensal[],
  regras: RegraImpacto[]
): Impacto[] {
  const impactos: Impacto[] = []

  // 1. Cargos vagos com subordinados
  for (const col of simulados) {
    if (col.status === 'vago') {
      const subordinados = obterSubordinados(simulados, col.id)
      if (subordinados.length > 0) {
        impactos.push(
          criarImpacto(
            'negativo',
            'Cargo vago com equipe',
            `${col.funcao} está vago e possui ${subordinados.length} subordinado(s)`,
            col.id,
            'VAGO'
          )
        )
      }
    }
  }

  // 2. Colaboradores cujo líder direto é VAGO
  for (const col of simulados) {
    if (col.status === 'vago') continue
    if (col.liderImediatoId) {
      const leader = simulados.find((c) => c.id === col.liderImediatoId)
      if (leader && leader.status === 'vago') {
        impactos.push(
          criarImpacto(
            'negativo',
            'Subordinado a cargo vago',
            `${col.nome} reporta a ${leader.funcao} (VAGO)`,
            col.id,
            col.nome
          )
        )
      }
    }
  }

  // 3. Promoções (função mudou em relação ao original)
  for (const col of simulados) {
    if (col.status === 'vago') continue
    const original = originais.find((c) => c.id === col.id)
    if (original && col.funcao !== original.funcao) {
      const media = mediaAvaliacoes(avaliacoes, col.id)
      const perfil = perfilColaborador(metricas, col.id)

      if (media >= 4.5) {
        impactos.push(
          criarImpacto(
            'positivo',
            'Promoção merecida — alta performance',
            `${col.nome} (avaliação ${media.toFixed(1)}) promovido de ${original.funcao} para ${col.funcao}`,
            col.id,
            col.nome,
            'promocao_avaliacao_alta'
          )
        )
      } else if (media >= 3.5) {
        impactos.push(
          criarImpacto(
            'positivo',
            'Promoção por crescimento',
            `${col.nome} promovido de ${original.funcao} para ${col.funcao}`,
            col.id,
            col.nome
          )
        )
      } else {
        impactos.push(
          criarImpacto(
            'neutro',
            'Promoção por necessidade',
            `${col.nome} promovido sem histórico de destaque (avaliação ${media.toFixed(1)})`,
            col.id,
            col.nome,
            'promocao_sem_destaque'
          )
        )
      }

      if (perfil === 'Ruim') {
        impactos.push(
          criarImpacto(
            'negativo',
            'Perfil inadequado para nova função',
            `${col.nome} tem perfil Ruim na função de ${col.funcao}`,
            col.id,
            col.nome,
            'lider_perfil_ruim'
          )
        )
      }
    }
  }

  // 4. Demissões (colaborador que era ativo e agora está VAGO)
  for (const col of simulados) {
    if (col.status === 'vago') {
      const original = originais.find((c) => c.id === col.id)
      if (original && original.status !== 'vago') {
        const subordinados = obterSubordinados(originais, col.id)
        if (subordinados.length > 0) {
          impactos.push(
            criarImpacto(
              'negativo',
              'Saída de liderança',
              `${original.nome} (${original.funcao}) foi desligado e tinha ${subordinados.length} subordinado(s)`,
              col.id,
              original.nome
            )
          )
        }

        const perfilLider = perfilColaborador(metricas, original.id)
        if (perfilLider === 'Bom') {
          impactos.push(
            criarImpacto(
              'negativo',
              'Saída de liderança de alto desempenho',
              `${original.nome} tinha perfil Bom — sua saída impacta a equipe`,
              col.id,
              original.nome,
              'perda_lider_experiente'
            )
          )
        } else if (perfilLider === 'Ruim') {
          impactos.push(
            criarImpacto(
              'positivo',
              'Substituto pode melhorar o time',
              `${original.nome} tinha perfil Ruim — a saída pode ser oportunidade`,
              col.id,
              original.nome
            )
          )
        }
      }
    }
  }

  // 5. Regras customizadas
  for (const regra of regras.filter((r) => r.ativa)) {
    const impactoRegra = aplicarRegraCustomizada(regra, originais, simulados, avaliacoes, metricas)
    if (impactoRegra) {
      impactos.push(impactoRegra)
    }
  }

  return impactos
}

// ---------- Cascata de promoções ----------

export interface SugestaoCascata {
  cargoVagoId: string
  cargoVagoNome: string
  cargoVagoFuncao: string
  sugeridoId: string
  sugeridoNome: string
  sugeridoFuncao: string
  score: number
}

export function calcularCascataPromocoes(
  colaboradores: Colaborador[],
  cargoVagoInicialId: string,
  avaliacoes: Avaliacao[],
  metricas: MetricaMensal[]
): SugestaoCascata[] {
  const resultado: SugestaoCascata[] = []
  const visitados = new Set<string>()
  let cargoVagoAtual = cargoVagoInicialId

  while (cargoVagoAtual && !visitados.has(cargoVagoAtual)) {
    visitados.add(cargoVagoAtual)

    const subordinados = colaboradores.filter(
      (c) => c.liderImediatoId === cargoVagoAtual && c.id !== cargoVagoAtual
    )

    if (subordinados.length === 0) break

    const candidatos = subordinados
      .map((col) => {
        const media = mediaAvaliacoes(avaliacoes, col.id)
        const perfil = perfilColaborador(metricas, col.id)
        const score = (media * 2) + (perfil === 'Bom' ? 1.5 : perfil === 'Ruim' ? -1 : 0) + (obterSubordinados(colaboradores, col.id).length * 0.5)
        return { col, media, perfil, score }
      })
      .sort((a, b) => b.score - a.score)

    const melhor = candidatos[0]
    if (!melhor) break

    const cargoVagoCol = colaboradores.find((c) => c.id === cargoVagoAtual)

    resultado.push({
      cargoVagoId: cargoVagoAtual,
      cargoVagoNome: cargoVagoCol?.nome || '',
      cargoVagoFuncao: cargoVagoCol?.funcao || '',
      sugeridoId: melhor.col.id,
      sugeridoNome: melhor.col.nome,
      sugeridoFuncao: melhor.col.funcao,
      score: melhor.score,
    })

    cargoVagoAtual = melhor.col.id
  }

  return resultado
}
