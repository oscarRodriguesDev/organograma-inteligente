'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cadastrarMetrica } from '@/lib/actions'
import type { Colaborador, Scorecard, ScorecardCategoria, ScorecardIndicador } from '@/lib/types'

// ─── Definição das categorias e seus indicadores padrão ───
const CATEGORIAS_PADRAO: { nome: string; peso: number; indicadores: { nome: string; meta: number }[] }[] = [
  {
    nome: 'Produtividade',
    peso: 15,
    indicadores: [
      { nome: 'Tarefas concluídas', meta: 20 },
      { nome: 'Cumprimento de prazos (%)', meta: 95 },
      { nome: 'Horas produtivas', meta: 160 },
    ],
  },
  {
    nome: 'Qualidade',
    peso: 15,
    indicadores: [
      { nome: 'Taxa de retrabalho (%)', meta: 5 },
      { nome: 'Índice de aprovação (%)', meta: 90 },
      { nome: 'Bugs/erros encontrados', meta: 3 },
    ],
  },
  {
    nome: 'Eficiência',
    peso: 10,
    indicadores: [
      { nome: 'Tempo médio de execução (h)', meta: 8 },
      { nome: 'Produtividade por hora', meta: 85 },
      { nome: 'Redução de desperdícios (%)', meta: 10 },
    ],
  },
  {
    nome: 'Assiduidade e Pontualidade',
    peso: 15,
    indicadores: [
      { nome: 'Dias trabalhados', meta: 22 },
      { nome: 'Faltas injustificadas', meta: 0 },
      { nome: 'Atrasos (horas)', meta: 0 },
    ],
  },
  {
    nome: 'Comportamento',
    peso: 10,
    indicadores: [
      { nome: 'Trabalho em equipe (0-10)', meta: 8 },
      { nome: 'Comunicação (0-10)', meta: 8 },
      { nome: 'Proatividade (0-10)', meta: 8 },
      { nome: 'Responsabilidade (0-10)', meta: 8 },
    ],
  },
  {
    nome: 'Desenvolvimento',
    peso: 10,
    indicadores: [
      { nome: 'Cursos realizados', meta: 1 },
      { nome: 'Novas competências', meta: 2 },
      { nome: 'Participação em treinamentos', meta: 2 },
    ],
  },
  {
    nome: 'Inovação',
    peso: 10,
    indicadores: [
      { nome: 'Ideias implementadas', meta: 2 },
      { nome: 'Processos melhorados', meta: 1 },
      { nome: 'Automações criadas', meta: 1 },
    ],
  },
  {
    nome: 'Relacionamento com Clientes',
    peso: 5,
    indicadores: [
      { nome: 'NPS (0-100)', meta: 75 },
      { nome: 'Tempo de resposta (h)', meta: 4 },
      { nome: 'Satisfação do cliente (0-10)', meta: 8 },
    ],
  },
  {
    nome: 'Resultados Financeiros',
    peso: 5,
    indicadores: [
      { nome: 'Meta atingida (%)', meta: 100 },
      { nome: 'Receita gerada (R$)', meta: 50000 },
      { nome: 'ROI dos projetos (%)', meta: 20 },
    ],
  },
  {
    nome: 'Liderança',
    peso: 5,
    indicadores: [
      { nome: 'Feedbacks realizados', meta: 4 },
      { nome: 'Desenvolvimento dos liderados (0-10)', meta: 7 },
      { nome: 'Cumprimento de metas da equipe (%)', meta: 85 },
    ],
  },
]

interface Props {
  colaboradores: Colaborador[]
  meses: string[]
  mesAtual: number
  anoAtual: number
}

function calcularNota(valor: number, meta: number, isMenorMelhor: boolean = false): number {
  if (meta === 0) return isMenorMelhor ? Math.max(0, 10 - valor) : 10
  const razao = valor / meta
  if (isMenorMelhor) {
    // Para métricas onde menor é melhor (ex: erros, atrasos)
    if (razao <= 0.5) return 10
    if (razao >= 2) return 0
    return Math.round(10 * (1 - (razao - 0.5) / 1.5) * 10) / 10
  }
  // Para métricas onde maior é melhor
  if (razao >= 1) return 10
  if (razao <= 0.3) return 0
  return Math.round(10 * razao * 10) / 10
}

function calcularNotaCategoria(indicadores: ScorecardIndicador[]): number {
  if (indicadores.length === 0) return 0
  const soma = indicadores.reduce((acc, ind) => acc + ind.nota, 0)
  return Math.round((soma / indicadores.length) * 10) / 10
}

function calcularNotaFinal(categorias: ScorecardCategoria[]): number {
  const totalPeso = categorias.reduce((acc, cat) => acc + cat.peso, 0)
  if (totalPeso === 0) return 0
  const somaPonderada = categorias.reduce((acc, cat) => acc + cat.nota * cat.peso, 0)
  return Math.round((somaPonderada / totalPeso) * 10) / 10
}

function categoriaInicial(): ScorecardCategoria[] {
  return CATEGORIAS_PADRAO.map((cat) => ({
    nome: cat.nome,
    peso: cat.peso,
    nota: 0,
    indicadores: cat.indicadores.map((ind) => ({
      nome: ind.nome,
      valor: 0,
      meta: ind.meta,
      nota: 0,
    })),
  }))
}

export function NovaMetricaForm({ colaboradores, meses, mesAtual, anoAtual }: Props) {
  const router = useRouter()
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [colaboradorId, setColaboradorId] = useState('')
  const [mes, setMes] = useState(mesAtual)
  const [ano, setAno] = useState(anoAtual)
  const [diasTrabalhados, setDiasTrabalhados] = useState(22)
  const [faltas, setFaltas] = useState(0)
  const [atrasos, setAtrasos] = useState(0)
  const [observacao, setObservacao] = useState('')
  const [categorias, setCategorias] = useState<ScorecardCategoria[]>(categoriaInicial)
  const [categoriasVisiveis, setCategoriasVisiveis] = useState<string[]>(CATEGORIAS_PADRAO.map(c => c.nome))

  function atualizarIndicador(catIdx: number, indIdx: number, campo: 'valor' | 'meta', valor: number) {
    setCategorias((prev) => {
      const novas = [...prev]
      const cat = { ...novas[catIdx] }
      const inds = [...cat.indicadores]
      const ind = { ...inds[indIdx] }
      ind[campo] = valor

      // Define se é "menor é melhor" baseado no nome do indicador
      const isMenorMelhor = /retrabalho|erros|bugs|atrasos|faltas|resposta|desperdício/i.test(ind.nome)
      ind.nota = calcularNota(
        campo === 'valor' ? valor : ind.valor,
        campo === 'meta' ? valor : ind.meta,
        isMenorMelhor
      )
      inds[indIdx] = ind
      cat.indicadores = inds
      cat.nota = calcularNotaCategoria(inds)
      novas[catIdx] = cat
      return novas
    })
  }

  function toggleCategoria(nome: string) {
    setCategoriasVisiveis((prev) =>
      prev.includes(nome) ? prev.filter((n) => n !== nome) : [...prev, nome]
    )
  }

  function resetarScorecard() {
    setCategorias(categoriaInicial())
    setCategoriasVisiveis(CATEGORIAS_PADRAO.map(c => c.nome))
  }

  const scorecardFinal: Scorecard = {
    categorias: categorias.filter((c) => c.indicadores.some((i) => i.valor > 0)),
    notaFinal: calcularNotaFinal(categorias),
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')

    if (!colaboradorId) {
      setErro('Selecione um colaborador')
      return
    }

    setSalvando(true)
    try {
      const formData = new FormData()
      formData.set('colaboradorId', colaboradorId)
      formData.set('mes', String(mes))
      formData.set('ano', String(ano))
      formData.set('diasTrabalhados', String(diasTrabalhados))
      formData.set('faltasInjustificadas', String(faltas))
      formData.set('horasAtraso', String(atrasos))
      formData.set('observacao', observacao)
      formData.set('scorecard', JSON.stringify(scorecardFinal))

      await cadastrarMetrica(formData)
      router.push('/metricas')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar métrica')
    } finally {
      setSalvando(false)
    }
  }

  const notaFinal = scorecardFinal.notaFinal

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados básicos */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Dados do Colaborador
        </h2>

        <div>
          <label htmlFor="colaboradorId" className="mb-1 block text-sm font-medium">
            Colaborador
          </label>
          <select
            id="colaboradorId"
            required
            value={colaboradorId}
            onChange={(e) => setColaboradorId(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          >
            <option value="">Selecione o colaborador</option>
            {colaboradores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} — {c.funcao}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="mes" className="mb-1 block text-sm font-medium">
              Mês
            </label>
            <select
              id="mes"
              required
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            >
              {meses.map((nome, i) => (
                <option key={i + 1} value={i + 1}>
                  {nome}
                </option>
              ))}
            </select>
          </div>
          <div className="w-28">
            <label htmlFor="ano" className="mb-1 block text-sm font-medium">
              Ano
            </label>
            <input
              id="ano"
              type="number"
              required
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
        </div>
      </div>

      {/* Scorecard - Categorias */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Scorecard de Desempenho
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-400">
              Peso total: {categorias.reduce((s, c) => s + c.peso, 0)}%
            </span>
            <button
              type="button"
              onClick={resetarScorecard}
              className="text-xs text-zinc-400 hover:text-zinc-600 underline"
            >
              Resetar
            </button>
          </div>
        </div>

        {categorias.map((cat, catIdx) => (
          <div
            key={cat.nome}
            className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggleCategoria(cat.nome)}
              className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{cat.nome}</span>
                <span className="text-xs text-zinc-400">
                  Peso: {cat.peso}% | Nota: <span className={cat.nota >= 7 ? 'text-emerald-600' : cat.nota >= 5 ? 'text-amber-600' : 'text-red-600'}>{cat.nota.toFixed(1)}</span>
                </span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${categoriasVisiveis.includes(cat.nome) ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {categoriasVisiveis.includes(cat.nome) && (
              <div className="p-4 space-y-2">
                {cat.indicadores.map((ind, indIdx) => (
                  <div key={ind.nome} className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-4 text-xs text-zinc-600 dark:text-zinc-400 truncate" title={ind.nome}>
                      {ind.nome}
                    </span>
                    <div className="col-span-3">
                      <input
                        type="number"
                        step="0.1"
                        value={ind.valor || ''}
                        onChange={(e) => atualizarIndicador(catIdx, indIdx, 'valor', Number(e.target.value))}
                        placeholder="Valor"
                        className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1.5 text-xs focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        step="0.1"
                        value={ind.meta}
                        onChange={(e) => atualizarIndicador(catIdx, indIdx, 'meta', Number(e.target.value))}
                        placeholder="Meta"
                        className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1.5 text-xs focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                    <span className={`col-span-2 text-xs font-medium text-right ${ind.nota >= 7 ? 'text-emerald-600' : ind.nota >= 5 ? 'text-amber-600' : 'text-red-600'}`}>
                      {ind.nota.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Nota Final */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-700">
          <span className="text-sm font-semibold">Nota Final</span>
          <div className={`text-2xl font-bold ${notaFinal >= 7 ? 'text-emerald-600' : notaFinal >= 5 ? 'text-amber-600' : 'text-red-600'}`}>
            {notaFinal.toFixed(1)}
            <span className="text-sm text-zinc-400 font-normal"> / 10</span>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${notaFinal >= 7 ? 'bg-emerald-500' : notaFinal >= 5 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${notaFinal * 10}%` }}
          />
        </div>
      </div>

      {/* Observação */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <label htmlFor="observacao" className="mb-1 block text-sm font-medium">
          Observação
        </label>
        <textarea
          id="observacao"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          placeholder="Observações adicionais sobre o período..."
        />
      </div>

      {erro && (
        <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm">
          {erro}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={salvando || !colaboradorId}
          className="flex-1 rounded-lg bg-black dark:bg-white px-4 py-2.5 text-sm font-medium text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
        >
          {salvando ? 'Salvando...' : 'Registrar Métrica'}
        </button>
        <Link
          href="/metricas"
          className="px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
