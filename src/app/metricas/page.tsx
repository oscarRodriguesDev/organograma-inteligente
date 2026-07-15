import Link from 'next/link'
import { listarMetricas } from '@/lib/db'
import { listarColaboradores } from '@/lib/db'
import { excluirMetricaAction } from './actions'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Métricas Mensais</h1>
          <Link
            href="/metricas/nova"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Nova Métrica
          </Link>
        </div>

        {metricas.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center">
            <p className="text-zinc-500">Nenhuma métrica registrada.</p>
            <Link
              href="/metricas/nova"
              className="mt-2 inline-block text-sm font-medium text-black underline"
            >
              Registrar primeira métrica
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Colaborador</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Período</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-600">Dias Trab.</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-600">Faltas</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-600">Atrasos (h)</th>
                  <th className="px-4 py-3 text-center font-medium text-zinc-600">Perfil</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {metricas.toReversed().map((m) => {
                  const perfilRuim = m.faltasInjustificadas > 2 || m.horasAtraso > 4
                  return (
                    <tr key={m.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 font-medium">{nomeColaborador(m.colaboradorId)}</td>
                      <td className="px-4 py-3 text-zinc-600">{MESES[m.mes - 1]} / {m.ano}</td>
                      <td className="px-4 py-3 text-right">{m.diasTrabalhados}</td>
                      <td className="px-4 py-3 text-right">{m.faltasInjustificadas}</td>
                      <td className="px-4 py-3 text-right">{m.horasAtraso}h</td>
                      <td className="px-4 py-3 text-center">
                        {perfilRuim ? (
                          <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                            Ruim
                          </span>
                        ) : (
                          <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            Bom
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <form action={excluirMetricaAction.bind(null, m.id)}>
                          <button type="submit" className="text-xs text-red-500 hover:text-red-700">
                            Excluir
                          </button>
                        </form>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
