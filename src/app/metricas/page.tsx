import Link from 'next/link'
import { listarMetricas } from '@/lib/db'
import { listarColaboradores } from '@/lib/db'
import { excluirMetricaAction } from './actions'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function corNota(nota: number): string {
  if (nota >= 7) return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30'
  if (nota >= 5) return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30'
  return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30'
}

export default async function ListaMetricas() {
  const [metricas, colaboradores] = await Promise.all([
    listarMetricas(),
    listarColaboradores(),
  ])

  function nomeColaborador(id: string) {
    return colaboradores.find((c) => c.id === id)?.nome || 'Desconhecido'
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Métricas de Desempenho</h1>
          <Link
            href="/metricas/nova"
            className="rounded-lg bg-black dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Nova Métrica
          </Link>
        </div>

        {metricas.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">Nenhuma métrica registrada.</p>
            <Link
              href="/metricas/nova"
              className="mt-2 inline-block text-sm font-medium text-black dark:text-white underline"
            >
              Registrar primeira métrica
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Colaborador</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Período</th>
                  <th className="px-4 py-3 text-center font-medium text-zinc-600 dark:text-zinc-400">Nota Final</th>
                  <th className="px-4 py-3 text-center font-medium text-zinc-600 dark:text-zinc-400">Dias Trab.</th>
                  <th className="px-4 py-3 text-center font-medium text-zinc-600 dark:text-zinc-400">Faltas</th>
                  <th className="px-4 py-3 text-center font-medium text-zinc-600 dark:text-zinc-400">Atrasos</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {metricas.toReversed().map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="px-4 py-3 font-medium">{nomeColaborador(m.colaboradorId)}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {MESES[m.mes - 1]} / {m.ano}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${corNota(m.scorecard.notaFinal)}`}>
                        {m.scorecard.notaFinal.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{m.diasTrabalhados}</td>
                    <td className="px-4 py-3 text-center">{m.faltasInjustificadas}</td>
                    <td className="px-4 py-3 text-center">{m.horasAtraso}h</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/metricas/${m.id}`}
                          className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline"
                        >
                          Detalhes
                        </Link>
                        <form action={excluirMetricaAction.bind(null, m.id)}>
                          <button type="submit" className="text-xs text-red-500 hover:text-red-700">
                            Excluir
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Resumo rápido */}
        {metricas.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Média Geral</p>
              <p className="text-2xl font-bold mt-1">
                {(metricas.reduce((s, m) => s + m.scorecard.notaFinal, 0) / metricas.length).toFixed(1)}
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Total de Registros</p>
              <p className="text-2xl font-bold mt-1">{metricas.length}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Maior Nota</p>
              <p className="text-2xl font-bold mt-1 text-emerald-600">
                {Math.max(...metricas.map(m => m.scorecard.notaFinal)).toFixed(1)}
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Menor Nota</p>
              <p className="text-2xl font-bold mt-1 text-red-600">
                {Math.min(...metricas.map(m => m.scorecard.notaFinal)).toFixed(1)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
