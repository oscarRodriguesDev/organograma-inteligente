'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { aprovarIniciativaAction, criarIniciativaAction } from './actions'
import type { DadosDesempenho } from './actions'

type TabKey = 'visao-geral' | 'metricas' | 'iniciativas' | 'conversas' | 'advertencias' | 'suspensoes' | 'projetos'

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'visao-geral', label: 'Visão Geral', icon: '📊' },
  { key: 'metricas', label: 'Métricas', icon: '📈' },
  { key: 'iniciativas', label: 'Iniciativas', icon: '💡' },
  { key: 'conversas', label: 'Feedbacks', icon: '💬' },
  { key: 'advertencias', label: 'Advertências', icon: '⚠️' },
  { key: 'suspensoes', label: 'Suspensões', icon: '🚫' },
  { key: 'projetos', label: 'Projetos', icon: '📁' },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function tipoMetricaLabel(tipo: string): string {
  const labels: Record<string, string> = {
    leve: '🔵 Leve',
    media: '🟡 Média',
    grave: '🔴 Grave',
  }
  return labels[tipo] ?? tipo
}

function statusIniciativaLabel(status: string): { label: string; class: string } {
  const map: Record<string, { label: string; class: string }> = {
    pendente: { label: '⏳ Pendente', class: 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300' },
    aprovada: { label: '✅ Aprovada', class: 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300' },
    recusada: { label: '❌ Recusada', class: 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300' },
  }
  return map[status] ?? { label: status, class: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400' }
}

function getMesAnoLabel(mes: number, ano: number) {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${meses[mes - 1]}/${ano}`
}

// ═════════════════════════════════════════════════════════
//  Componente Principal
// ═════════════════════════════════════════════════════════

export default function MeuDesempenhoClient({
  dados,
  isProprio,
  isGestor,
}: {
  dados: DadosDesempenho
  isProprio: boolean
  isGestor: boolean
}) {
  const router = useRouter()
  const [tabAtiva, setTabAtiva] = useState<TabKey>('visao-geral')
  const [msgSucesso, setMsgSucesso] = useState('')
  const [erro, setErro] = useState('')
  const [showNovaIniciativa, setShowNovaIniciativa] = useState(false)
  const { colaborador, metricas, iniciativas, conversas, advertencias, suspensoes, projetos } = dados

  const podeAprovar = isGestor && !isProprio

  async function handleAprovarIniciativa(id: string, status: 'aprovada' | 'recusada') {
    setMsgSucesso('')
    setErro('')
    try {
      await aprovarIniciativaAction(id, status)
      setMsgSucesso(`Iniciativa ${status === 'aprovada' ? 'aprovada' : 'recusada'} com sucesso!`)
      router.refresh()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao processar')
    }
  }

  // ─── Card do Cabeçalho ─────────────────────────────────
  function Cabecalho() {
    return (
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 shrink-0">
            {colaborador.fotoUrl ? (
              <img src={colaborador.fotoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-zinc-400">{colaborador.nome.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-foreground truncate">{colaborador.nome}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{colaborador.funcao}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-medium px-2 py-0.5">
                {colaborador.papel}
              </span>
              {colaborador.liderNome && (
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Líder: {colaborador.liderNome}
                </span>
              )}
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                Desde {formatDate(colaborador.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Navegação por Tabs (Mobile-Friendly) ──────────────
  function TabNavigation() {
    return (
      <div className="flex gap-1 overflow-x-auto pb-2 mb-4 scrollbar-hide -mx-1 px-1">
        {TABS.map((tab) => {
          const isActive = tabAtiva === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTabAtiva(tab.key)}
              className={`
                shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200
                ${isActive
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800/70 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }
              `}
            >
              <span className="text-sm">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  // ─── Seção: Visão Geral ────────────────────────────────
  function SecaoVisaoGeral() {
    const totalMetricas = metricas.length
    const totalIniciativas = iniciativas.length
    const iniciativasAprovadas = iniciativas.filter(i => i.status === 'aprovada').length
    const totalConversas = conversas.length
    const totalAdvertencias = advertencias.length
    const totalSuspensoes = suspensoes.length
    const diasTrabalhados = metricas.reduce((acc, m) => acc + m.diasTrabalhados, 0)

    return (
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground mb-3">📊 Visão Geral</h2>

        <div className="grid grid-cols-2 gap-3">
          <CardStat label="Métricas" value={totalMetricas.toString()} icon="📈" />
          <CardStat label="Iniciativas" value={totalIniciativas.toString()} icon="💡" />
          <CardStat label="Aprovadas" value={iniciativasAprovadas.toString()} icon="✅" />
          <CardStat label="Feedbacks" value={totalConversas.toString()} icon="💬" />
          <CardStat label="Advertências" value={totalAdvertencias.toString()} icon="⚠️" color={totalAdvertencias > 0 ? 'text-red-500' : ''} />
          <CardStat label="Suspensões" value={totalSuspensoes.toString()} icon="🚫" color={totalSuspensoes > 0 ? 'text-red-500' : ''} />
        </div>

        {metricas.length > 0 && (
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 mt-3">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Total de dias trabalhados: <strong className="text-foreground">{diasTrabalhados}</strong>
            </p>
          </div>
        )}

        {iniciativas.length > 0 && (
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Iniciativas: {iniciativasAprovadas} aprovadas de {totalIniciativas} ({Math.round((iniciativasAprovadas / totalIniciativas) * 100)}%)
            </p>
          </div>
        )}
      </div>
    )
  }

  function CardStat({ label, value, icon, color }: { label: string; value: string; icon: string; color?: string }) {
    return (
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-lg">{icon}</span>
          <span className={`text-xl font-bold ${color ?? 'text-foreground'}`}>{value}</span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      </div>
    )
  }

  // ─── Seção: Métricas ───────────────────────────────────
  function SecaoMetricas() {
    if (metricas.length === 0) {
      return <EmptyState message="Nenhuma métrica registrada ainda." />
    }

    return (
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground mb-2">📈 Métricas de Desempenho</h2>
        {metricas.map((m) => (
          <div key={m.id} className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-foreground">{getMesAnoLabel(m.mes, m.ano)}</span>
              <span className="text-[11px] text-zinc-400">{formatDateTime(m.data)}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-2">
              <MiniStat label="Dias Trab." value={m.diasTrabalhados.toString()} />
              <MiniStat label="Faltas" value={m.faltasInjustificadas.toString()} color={m.faltasInjustificadas > 0 ? 'text-red-500' : ''} />
              <MiniStat label="Horas Atraso" value={`${m.horasAtraso}h`} color={m.horasAtraso > 0 ? 'text-red-500' : ''} />
            </div>
            {m.observacao && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                {m.observacao}
              </p>
            )}
          </div>
        ))}
      </div>
    )
  }

  function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
      <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-2.5 text-center">
        <p className={`text-base font-bold ${color ?? 'text-foreground'}`}>{value}</p>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{label}</p>
      </div>
    )
  }

  // ─── Seção: Iniciativas ────────────────────────────────
  function SecaoIniciativas() {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-foreground">💡 Iniciativas</h2>
          <div className="flex items-center gap-2">
            {!isProprio && (
              <p className="text-[11px] text-zinc-400 hidden sm:block">Clique para aprovar/recusar</p>
            )}
            {isProprio && (
              <button
                type="button"
                onClick={() => setShowNovaIniciativa(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nova
              </button>
            )}
          </div>
        </div>

        {iniciativas.length === 0 && !showNovaIniciativa ? (
          <EmptyState message="Nenhuma iniciativa registrada ainda." />
        ) : (
          <>
            {iniciativas.map((i) => {
              const st = statusIniciativaLabel(i.status)
              return (
                <div key={i.id} className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-foreground">{i.titulo}</h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{formatDate(i.data)}</p>
                    </div>
                    <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${st.class}`}>
                      {st.label}
                    </span>
                  </div>
                  {i.descricao && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">{i.descricao}</p>
                  )}
                  {i.valorResultado > 0 && (
                    <div className="inline-block rounded bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                      {i.valorResultado.toLocaleString('pt-BR')} {i.unidadeMedida}
                    </div>
                  )}
                  {i.resultado && (
                    <div className="rounded bg-green-50 dark:bg-green-950/30 px-3 py-2 text-xs text-green-700 dark:text-green-300 mt-1">
                      <span className="font-medium">Resultado:</span> {i.resultado}
                    </div>
                  )}

                  {/* Botões de aprovação (só para gestores que não são o próprio colaborador) */}
                  {podeAprovar && i.status === 'pendente' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => handleAprovarIniciativa(i.id, 'aprovada')}
                        className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                      >
                        ✅ Aprovar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAprovarIniciativa(i.id, 'recusada')}
                        className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                      >
                        ❌ Recusar
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

        {/* Modal de Nova Iniciativa */}
        {showNovaIniciativa && (
          <NovaIniciativaModal
            onClose={() => setShowNovaIniciativa(false)}
            onSuccess={() => {
              setShowNovaIniciativa(false)
              setMsgSucesso('Iniciativa registrada com sucesso! Aguarde a aprovação do gestor.')
              router.refresh()
            }}
          />
        )}
      </div>
    )
  }

  // ─── Seção: Feedbacks (Conversas) ──────────────────────
  function SecaoFeedbacks() {
    if (conversas.length === 0) {
      return <EmptyState message="Nenhum feedback registrado ainda." />
    }

    return (
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground mb-2">💬 Feedbacks e Reuniões</h2>
        {conversas.map((c) => (
          <div key={c.id} className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-foreground">{c.titulo}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="rounded-full bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-[10px] font-medium px-2 py-0.5">
                    {c.tipo}
                  </span>
                  {c.colaboradorNome && (
                    <span className="text-[11px] text-zinc-400">{c.colaboradorNome}</span>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-zinc-400 shrink-0">{formatDate(c.realizadaEm)}</span>
            </div>

            {c.resumo && (
              <div className="mb-2">
                <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-0.5">Resumo:</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">{c.resumo}</p>
              </div>
            )}

            {c.pontosPositivos && (
              <div className="rounded-lg bg-green-50 dark:bg-green-950/20 px-3 py-2 mb-1.5">
                <p className="text-[11px] font-medium text-green-600 dark:text-green-400 mb-0.5">✅ Pontos Positivos</p>
                <p className="text-xs text-green-700 dark:text-green-300">{c.pontosPositivos}</p>
              </div>
            )}

            {c.pontosMelhoria && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 px-3 py-2">
                <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mb-0.5">🎯 Pontos de Melhoria / Compromissos</p>
                <p className="text-xs text-amber-700 dark:text-amber-300">{c.pontosMelhoria}</p>
              </div>
            )}

            {c.observacoes && (
              <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-0.5">Observações:</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{c.observacoes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // ─── Seção: Advertências ───────────────────────────────
  function SecaoAdvertencias() {
    if (advertencias.length === 0) {
      return <EmptyState message="Nenhuma advertência registrada. 🎉" />
    }

    return (
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground mb-2">⚠️ Advertências</h2>
        {advertencias.map((a) => (
          <div key={a.id} className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 border-l-4"
            style={{
              borderLeftColor: a.tipo === 'grave' ? '#EF4444' : a.tipo === 'media' ? '#EAB308' : '#3B82F6',
            }}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-foreground">{a.titulo}</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">{formatDate(a.data)}</p>
              </div>
              <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {tipoMetricaLabel(a.tipo)}
              </span>
            </div>
            {a.descricao && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{a.descricao}</p>
            )}
            {a.aplicadaPorNome && (
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-2">
                Aplicada por: {a.aplicadaPorNome}
              </p>
            )}
          </div>
        ))}
      </div>
    )
  }

  // ─── Seção: Projetos ──────────────────────────────────
  function SecaoProjetos() {
    if (projetos.length === 0) {
      return <EmptyState message="Nenhum projeto registrado. 🎯" />
    }

    return (
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground mb-2">📁 Projetos</h2>
        {projetos.map((p) => {
          const statusLabel: Record<string, { label: string; class: string }> = {
            em_andamento: { label: '🔄 Em andamento', class: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300' },
            concluido: { label: '✅ Concluído', class: 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300' },
            pausado: { label: '⏸️ Pausado', class: 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300' },
            cancelado: { label: '❌ Cancelado', class: 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300' },
          }
          const st = statusLabel[p.status] ?? { label: p.status, class: 'bg-zinc-100 text-zinc-600' }
          return (
            <div key={p.id} className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-foreground">{p.nome}</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {formatDate(p.dataInicio)}
                    {p.dataFim && ` — ${formatDate(p.dataFim)}`}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${st.class}`}>
                  {st.label}
                </span>
              </div>
              {p.descricao && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{p.descricao}</p>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // ─── Seção: Suspensões ─────────────────────────────────
  function SecaoSuspensoes() {
    if (suspensoes.length === 0) {
      return <EmptyState message="Nenhuma suspensão registrada. 🎉" />
    }

    return (
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground mb-2">🚫 Suspensões</h2>
        {suspensoes.map((s) => (
          <div key={s.id} className="bg-white dark:bg-zinc-950 rounded-xl border border-red-200 dark:border-red-900/50 p-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-foreground">{s.motivo}</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {formatDate(s.dataInicio)}
                  {s.dataFim && ` — ${formatDate(s.dataFim)}`}
                  {!s.dataFim && ' (em aberto)'}
                </p>
              </div>
            </div>
            {s.observacao && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{s.observacao}</p>
            )}
            {s.aplicadaPorNome && (
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-2">
                Aplicada por: {s.aplicadaPorNome}
              </p>
            )}
          </div>
        ))}
      </div>
    )
  }

  // ─── Render Principal ──────────────────────────────────
  return (
    <div className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
      {/* Mensagens de feedback */}
      {msgSucesso && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm">
          {msgSucesso}
        </div>
      )}
      {erro && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm">
          {erro}
        </div>
      )}

      <Cabecalho />

      <TabNavigation />

      {/* Conteúdo da tab ativa */}
      {tabAtiva === 'visao-geral' && <SecaoVisaoGeral />}
      {tabAtiva === 'metricas' && <SecaoMetricas />}
      {tabAtiva === 'iniciativas' && <SecaoIniciativas />}
      {tabAtiva === 'conversas' && <SecaoFeedbacks />}
      {tabAtiva === 'advertencias' && <SecaoAdvertencias />}
      {tabAtiva === 'suspensoes' && <SecaoSuspensoes />}
      {tabAtiva === 'projetos' && <SecaoProjetos />}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
//  Modal: Nova Iniciativa
// ═════════════════════════════════════════════════════════

function NovaIniciativaModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(formData: FormData) {
    setErro('')
    setEnviando(true)
    try {
      const res = await criarIniciativaAction(formData)
      if (res.ok) {
        onSuccess()
      } else {
        setErro(res.erro ?? 'Erro ao criar iniciativa')
      }
    } catch {
      setErro('Erro de conexão')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-foreground">💡 Nova Iniciativa</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="p-5 space-y-4">
          {erro && (
            <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
              {erro}
            </div>
          )}

          <div>
            <label htmlFor="titulo" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              required
              maxLength={200}
              placeholder="Ex: Implementar novo processo de onboarding"
              className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>

          <div>
            <label htmlFor="descricao" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              rows={3}
              placeholder="Descreva sua iniciativa em detalhes..."
              className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none"
            />
          </div>

          <div>
            <label htmlFor="resultado" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              Resultado esperado
            </label>
            <textarea
              id="resultado"
              name="resultado"
              rows={2}
              placeholder="Qual o resultado esperado com essa iniciativa?"
              className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="valorResultado" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Valor do resultado
              </label>
              <input
                type="number"
                id="valorResultado"
                name="valorResultado"
                min={0}
                step="0.01"
                placeholder="0,00"
                className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
            <div>
              <label htmlFor="unidadeMedida" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Unidade de medida
              </label>
              <input
                type="text"
                id="unidadeMedida"
                name="unidadeMedida"
                placeholder="Ex: horas, %, R$"
                className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Sua iniciativa será registrada como <strong>pendente</strong> e precisará de aprovação do seu gestor.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
            >
              {enviando ? 'Salvando...' : 'Salvar Iniciativa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
