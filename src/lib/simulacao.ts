import type { Colaborador, Avaliacao, MetricaMensal, Impacto, AcaoSimulacao, RegraImpacto, TipoImpacto, ScoreColaborador } from './types'
import { Papel, calcularPapelSubordinado } from './types'

let impactoIdCounter = 0
function genImpactoId(): string {
  return `imp_${++impactoIdCounter}_${Date.now()}`
}

// ---------- utils ----------

export function obterSubordinados(colaboradores: Colaborador[], id: string): Colaborador[] {
  return colaboradores.filter((c) => c.liderImediatoId === id)
}

export function obterDescendentes(colaboradores: Colaborador[], id: string): Colaborador[] {
  const result: Colaborador[] = []
  const visitados = new Set<string>()
  function dfs(pid: string) {
    if (visitados.has(pid)) return  // safety: cycle guard
    visitados.add(pid)
    for (const c of colaboradores.filter((c) => c.liderImediatoId === pid)) {
      result.push(c)
      dfs(c.id)
    }
  }
  dfs(id)
  return result
}

function calcularNivel(colaboradores: Colaborador[], id: string): number {
  let nivel = 0
  let currentId: string | null = id
  const visitados = new Set<string>()
  while (currentId) {
    if (visitados.has(currentId)) break  // safety: cycle guard
    visitados.add(currentId)
    const atual = colaboradores.find((c) => c.id === currentId)
    if (!atual || !atual.liderImediatoId) break
    nivel++
    currentId = atual.liderImediatoId
  }
  return nivel
}

function obterLider(colaboradores: Colaborador[], id: string): Colaborador | undefined {
  const col = colaboradores.find((c) => c.id === id)
  if (!col || !col.liderImediatoId) return undefined
  return colaboradores.find((c) => c.id === col.liderImediatoId)
}

export function mediaAvaliacoes(avaliacoes: Avaliacao[], colaboradorId: string): number {
  const notas = avaliacoes
    .filter((a) => a.avaliadoId === colaboradorId)
    .flatMap((a) => a.criterios.map((c) => c.nota))
  if (notas.length === 0) return 0
  return notas.reduce((s, n) => s + n, 0) / notas.length
}

export function perfilColaborador(metricas: MetricaMensal[], colaboradorId: string): 'Bom' | 'Ruim' | 'desconhecido' {
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
    case 'salto_hierarquico': {
      const limite = (regra.condicao.parametros?.limite_saltos as number) ?? 1
      for (const col of simulados) {
        if (col.status === 'vago') continue
        const original = originais.find((c) => c.id === col.id)
        if (!original || original.status === 'vago') continue
        if (original.funcao === col.funcao) continue
        const nivelOriginal = calcularNivel(originais, original.id)
        const nivelNovo = calcularNivel(simulados, col.id)
        if (Math.abs(nivelNovo - nivelOriginal) > limite) {
          return criarImpacto(
            regra.tipo,
            regra.nome,
            `${col.nome} subiu de nível ${nivelOriginal} → ${nivelNovo} (limite: ${limite})`,
            col.id,
            col.nome,
            regra.id
          )
        }
      }
      return null
    }
    case 'ex_colegas_subordinados': {
      for (const col of simulados) {
        if (col.status === 'vago') continue
        const original = originais.find((c) => c.id === col.id)
        if (!original || original.status === 'vago') continue
        if (original.funcao === col.funcao) continue
        const exPares = originais.filter(
          (c) => c.id !== original.id && c.liderImediatoId === original.liderImediatoId
        )
        for (const exPar of exPares) {
          const simPar = simulados.find((c) => c.id === exPar.id)
          if (simPar && simPar.liderImediatoId === col.id) {
            return criarImpacto(
              regra.tipo,
              regra.nome,
              `${exPar.nome} era par de ${col.nome} e agora é subordinado`,
              col.id,
              col.nome,
              regra.id
            )
          }
        }
      }
      return null
    }
    case 'cascata_excessiva': {
      const limite = (regra.condicao.parametros?.limite_profundidade as number) ?? 2
      for (const v of simulados.filter((c) => c.status === 'vago')) {
        let profundidade = 1
        const visitVago = new Set<string>()
        let atual = v
        while (atual.liderImediatoId) {
          if (visitVago.has(atual.id)) break  // safety: cycle guard
          visitVago.add(atual.id)
          const leader = simulados.find((c) => c.id === atual.liderImediatoId)
          if (leader?.status === 'vago') {
            profundidade++
            atual = leader
          } else break
        }
        if (profundidade > limite) {
          return criarImpacto(
            regra.tipo,
            regra.nome,
            `Cascata de ${profundidade} níveis de VAGO (limite: ${limite})`,
            undefined,
            undefined,
            regra.id
          )
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
    // NÃO transfere subordinados — eles ficam sob o VAGO
    // O VAGO mantém suas conexões (edges) e subordinados visíveis
    // Isso permite "promover de baixo" para preencher a vaga

    // Marca como vago em vez de remover
    colAlvo.status = 'vago'
    colAlvo.nome = 'VAGO'
    // Mantém o liderImediatoId original para preservar a conexão superior
    // Subordinados permanecem com liderImediatoId = colAlvo.id (não são transferidos)
  }

  if (acao.tipo === 'realocacao') {
    const colAlvo = colaboradores.find((c) => c.id === acao.colaboradorId)
    if (!colAlvo) return { colaboradores, impactos }
    const antigoLiderId = colAlvo.liderImediatoId
    colAlvo.liderImediatoId = acao.novoLiderId ?? null
    colAlvo.status = 'ativo'

    // Recalcula o papel com base no novo líder
    if (colAlvo.liderImediatoId) {
      const lider = colaboradores.find((c) => c.id === colAlvo.liderImediatoId)
      if (lider) {
        colAlvo.papel = calcularPapelSubordinado(lider.papel)
      }
    } else {
      colAlvo.papel = Papel.OPERACIONAL
    }

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
        empresaId: promovido.empresaId,
        nome: 'VAGO',
        funcao: promovido.funcao,
        papel: Papel.COLABORADOR,
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

      // Recalcula o papel do promovido com base no novo líder
      if (promovido.liderImediatoId) {
        const lider = colaboradores.find((c) => c.id === promovido.liderImediatoId)
        if (lider) {
          promovido.papel = calcularPapelSubordinado(lider.papel)
        }
      } else {
        promovido.papel = Papel.OPERACIONAL
      }

      // Transfere TODOS os subordinados do VAGO para o promovido
      // (com a nova abordagem, subordinados NÃO são transferidos na demissão
      //  — eles ficam sob o VAGO, e ao preencher a vaga, herdam o novo líder)
      const subordinadosVago = obterSubordinados(colaboradores, cargoVago.id)
      for (const sub of subordinadosVago) {
        if (sub.id !== promovido.id) {
          sub.liderImediatoId = promovido.id
        }
      }

      // Remove o nó vago original e corrige referências
      const removedVagoId = cargoVago.id
      const removedVagoLeaderId = cargoVago.liderImediatoId
      const idx = colaboradores.findIndex((c) => c.id === removedVagoId)
      if (idx !== -1) {
        colaboradores.splice(idx, 1)

        // Corrige referências ao VAGO removido:
        // quem apontava para ele (ex: VAGO criado na posição antiga do promovido)
        // agora aponta para o líder do VAGO (sobe na hierarquia)
        for (const c of colaboradores) {
          if (c.liderImediatoId === removedVagoId) {
            c.liderImediatoId = removedVagoLeaderId
          }
        }
      }
    } else {
      // Promoção direta: escolhe novo líder e cargo
      const promovido = colaboradores.find((c) => c.id === acao.colaboradorId)
      if (!promovido) return { colaboradores, impactos }

      const antigoLiderId = promovido.liderImediatoId
      const subordinados = obterSubordinados(colaboradores, promovido.id)

      // Cria um nó vago no lugar do promovido
      const vago: Colaborador = {
        id: `vago_${promovido.id}`,
        empresaId: promovido.empresaId,
        nome: 'VAGO',
        funcao: promovido.funcao,
        papel: Papel.COLABORADOR,
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
  regras: RegraImpacto[],
  scores?: Record<string, ScoreColaborador>
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

  // 6. Salto hierárquico (promoção que pula mais de 1 nível)
  for (const col of simulados) {
    if (col.status === 'vago') continue
    const original = originais.find((c) => c.id === col.id)
    if (!original || original.status === 'vago') continue

    const nivelOriginal = calcularNivel(originais, original.id)
    const nivelNovo = calcularNivel(simulados, col.id)

    // Só considera salto se o colaborador MUDOU de função (foi promovido)
    if (original.funcao !== col.funcao) {
      const saltos = Math.abs(nivelNovo - nivelOriginal)
      if (saltos > 1) {
        impactos.push(
          criarImpacto(
            'negativo',
            'Salto hierárquico — promoção acima de 1 nível',
            `${col.nome} subiu ${saltos} nível(is) de ${original.funcao} para ${col.funcao} — risco de incapacidade (Princípio de Peter)`,
            col.id,
            col.nome,
            'salto_hierarquico'
          )
        )
      }
    }
  }

  // 7. Ex-colegas viram subordinados
  for (const col of simulados) {
    if (col.status === 'vago') continue
    const original = originais.find((c) => c.id === col.id)
    if (!original || original.status === 'vago') continue
    if (original.funcao === col.funcao) continue // só se houve promoção

    // Descobre quem eram os pares do promovido (mesmo líder antes)
    const exPares = originais.filter(
      (c) => c.id !== original.id && c.liderImediatoId === original.liderImediatoId
    )

    // Verifica se algum desses pares agora é subordinado do promovido
    for (const exPar of exPares) {
      const simPar = simulados.find((c) => c.id === exPar.id)
      if (simPar && simPar.liderImediatoId === col.id) {
        impactos.push(
          criarImpacto(
            'negativo',
            'Ex-colega agora é subordinado',
            `${exPar.nome} era par de ${col.nome} e agora reporta a ele — possível tensão no time`,
            col.id,
            col.nome,
            'ex_colegas_subordinados'
          )
        )
      }
    }
  }

  // 8. Cascata excessiva (contar VAGOs criados em cadeia)
  const vagosCriados = simulados.filter(
    (c) => c.status === 'vago' && !originais.some((o) => o.id === c.id)
  )
  // VAGOs que foram criados e formam uma cadeia (um VAGO reporta a outro VAGO)
  const vagosEmCadeia = vagosCriados.filter((v) => {
    if (!v.liderImediatoId) return false
    const leader = simulados.find((c) => c.id === v.liderImediatoId)
    return leader?.status === 'vago'
  })
  // Conta profundidade da cascata: quantos VAGOs em sequência existem
  let profundidadeCascata = 0
  for (const v of simulados.filter((c) => c.status === 'vago')) {
    let profundidade = 1
    const visitVago = new Set<string>()
    let atual = v
    while (atual.liderImediatoId) {
      if (visitVago.has(atual.id)) break  // safety: cycle guard
      visitVago.add(atual.id)
      const leader = simulados.find((c) => c.id === atual.liderImediatoId)
      if (leader?.status === 'vago') {
        profundidade++
        atual = leader
      } else break
    }
    if (profundidade > profundidadeCascata) {
      profundidadeCascata = profundidade
    }
  }
  if (profundidadeCascata >= 3) {
    impactos.push(
      criarImpacto(
        'negativo',
        'Cascata excessiva de cargos vagos',
        `${profundidadeCascata} níveis consecutivos de VAGO — desestabilização estrutural do organograma`,
        undefined,
        undefined,
        'cascata_excessiva'
      )
    )
  } else if (vagosEmCadeia.length >= 2) {
    impactos.push(
      criarImpacto(
        'negativo',
        'Cadeia de cargos vagos',
        `${vagosEmCadeia.length} cargos vagos conectados — risco de propagação de instabilidade`,
        undefined,
        undefined,
        'cascata_excessiva'
      )
    )
  }

  // 9. Regras customizadas
  for (const regra of regras.filter((r) => r.ativa)) {
    const impactoRegra = aplicarRegraCustomizada(regra, originais, simulados, avaliacoes, metricas)
    if (impactoRegra) {
      impactos.push(impactoRegra)
    }
  }

  // 10. Análise de scores consolidados (fit cultural, sentimento, conversas, DISC)
  if (scores) {
    for (const col of simulados) {
      if (col.status === 'vago') continue
      const score = scores[col.id]
      if (!score) continue

      const simulado = simulados.find((c) => c.id === col.id)
      const original = originais.find((c) => c.id === col.id)

      // Score fit cultural baixo = risco de desalinhamento cultural
      if (score.scoreFitCultural > 0 && score.scoreFitCultural < 4) {
        impactos.push(criarImpacto(
          'negativo',
          'Baixo alinhamento cultural',
          `${col.nome} tem score fit cultural ${score.scoreFitCultural}/10 — risco de desalinhamento com a cultura`,
          col.id, col.nome, 'lider_perfil_ruim'
        ))
      }

      // Score fit cultural alto = ponto positivo
      if (score.scoreFitCultural >= 8) {
        impactos.push(criarImpacto(
          'positivo',
          'Alto alinhamento cultural',
          `${col.nome} tem excelente fit cultural (${score.scoreFitCultural}/10)`,
          col.id, col.nome
        ))
      }

      // Score sentimento baixo = insatisfação
      if (score.scoreSentimento > 0 && score.scoreSentimento < 4) {
        impactos.push(criarImpacto(
          'negativo',
          'Sentimento negativo em relação à empresa',
          `${col.nome} registrou score de sentimento ${score.scoreSentimento}/10 — possível insatisfação`,
          col.id, col.nome
        ))
      }

      // Conversas regulares e positivas = engajamento
      if (score.scoreConversas >= 7) {
        impactos.push(criarImpacto(
          'positivo',
          'Bom engajamento (conversas regulares)',
          `${col.nome} tem score de conversas ${score.scoreConversas}/10 — feedbacks regulares e construtivos`,
          col.id, col.nome
        ))
      }

      // Score geral baixo = alerta
      if (score.scoreGeral > 0 && score.scoreGeral < 3) {
        impactos.push(criarImpacto(
          'negativo',
          'Score geral crítico',
          `${col.nome} tem score geral ${score.scoreGeral}/10 — requires atenção`,
          col.id, col.nome
        ))
      }

      // Score geral alto = destaque positivo
      if (score.scoreGeral >= 8) {
        impactos.push(criarImpacto(
          'positivo',
          'Score geral de destaque',
          `${col.nome} tem score geral ${score.scoreGeral}/10 — colaborador de alto desempenho`,
          col.id, col.nome
        ))
      }

      // Promoção: verifica se score geral é compatível
      if (original && simulado && original.funcao !== simulado.funcao && original.status !== 'vago') {
        if (score.scoreGeral < 5) {
          impactos.push(criarImpacto(
            'negativo',
            'Promoção de risco (score baixo)',
            `${col.nome} foi promovido mas tem score geral ${score.scoreGeral}/10 — risco de Princípio de Peter`,
            col.id, col.nome
          ))
        }
        if (score.scoreGeral >= 8) {
          impactos.push(criarImpacto(
            'positivo',
            'Promoção de alto potencial',
            `${col.nome} foi promovido com score geral ${score.scoreGeral}/10 — alta probabilidade de sucesso`,
            col.id, col.nome
          ))
        }
      }

      // Demissão: impacto adicional se score for alto (perda de talento)
      if (original && !simulado) {
        if (score.scoreGeral >= 7) {
          impactos.push(criarImpacto(
            'negativo',
            'Perda de talento de alto score',
            `${col.nome} (score ${score.scoreGeral}/10) saiu — perda significativa para a organização`,
            col.id, col.nome
          ))
        }
      }
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
