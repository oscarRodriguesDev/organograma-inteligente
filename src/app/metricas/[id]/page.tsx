import Link from 'next/link'
import { notFound } from 'next/navigation'
import { listarMetricas, listarColaboradores } from '@/lib/db'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function corNota(nota: number): string {
  if (nota >= 7) return 'text-emerald-600'
  if (nota >= 5) return 'text-amber-600'
  return 'text-red-600'
}

function bgCorNota(nota: number): string {
  if (nota >= 7) return 'bg-emerald-500'
  if (nota >= 5) return 'bg-amber-500'
  return 'bg-red-500'
}

export default async function DetalheMetricaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [metricas, colaboradores] = await Promise.all([
    listarMetricas(),
    listarColaboradores(),
  ])

  const metrica = metricas.find((m) => m.id === id)
  if (!metrica) notFound()

  const colaborador = colaboradores.find((c) => c.id === metrica.colaboradorId)
  const { scorecard } = metrica

  return (
    <div className="flex-1 p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/metricas"
          className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          ← Voltar para Métricas
        </Link>

        <div className="mt-4 mb-8">
          <h1 className="text-2xl font-bold">{colaborador?.nome || 'Desconhecido'}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {colaborador?.funcao} — {MESES[metrica.mes - 1]} / {metrica.ano}
          </p>
        </div>

        {/* Scorecard */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Scorecard de Desempenho
            </h2>
            <div className={`text-3xl font-bold ${corNota(scorecard.notaFinal)}`}>
              {scorecard.notaFinal.toFixed(1)}
              <span className="text-base text-zinc-400 font-normal"> / 10</span>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-3 mb-8 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${bgCorNota(scorecard.notaFinal)}`}
              style={{ width: `${scorecard.notaFinal * 10}%` }}
            />
          </div>

          {/* Categorias */}
          <div className="space-y-4">
            {scorecard.categorias.map((cat) => {
              const mediaCat = cat.indicadores.length > 0
                ? cat.indicadores.reduce((s, i) => s + i.nota, 0) / cat.indicadores.length
                : 0
              return (
                <div key={cat.nome} className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{cat.nome}</span>
                      <span className="text-xs text-zinc-400">Peso: {cat.peso}%</span>
                    </div>
                    <span className={`text-sm font-semibold ${corNota(mediaCat)}`}>
                      {mediaCat.toFixed(1)}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    {cat.indicadores.map((ind) => (
                      <div key={ind.nome} className="grid grid-cols-12 gap-2 items-center text-xs">
                        <span className="col-span-4 text-zinc-600 dark:text-zinc-400">{ind.nome}</span>
                        <span className="col-span-2 text-right text-zinc-500">
                          Valor: <strong>{ind.valor}</strong>
                        </span>
                        <span className="col-span-2 text-right text-zinc-500">
                          Meta: <strong>{ind.meta}</strong>
                        </span>
                        <span className={`col-span-2 text-right font-semibold ${corNota(ind.nota)}`}>
                          {ind.nota.toFixed(1)}
                        </span>
                        <div className="col-span-2">
                          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${bgCorNota(ind.nota)}`}
                              style={{ width: `${ind.nota * 10}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Assiduidade */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
            Assiduidade e Pontualidade
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-zinc-500">Dias Trabalhados</p>
              <p className="text-lg font-semibold">{metrica.diasTrabalhados}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Faltas Injustificadas</p>
              <p className={`text-lg font-semibold ${metrica.faltasInjustificadas > 0 ? 'text-red-600' : ''}`}>
                {metrica.faltasInjustificadas}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Horas de Atraso</p>
              <p className={`text-lg font-semibold ${metrica.horasAtraso > 0 ? 'text-red-600' : ''}`}>
                {metrica.horasAtraso}h
              </p>
            </div>
          </div>
        </div>

        {metrica.observacao && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Observação
            </h2>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{metrica.observacao}</p>
          </div>
        )}
      </div>
    </div>
  )
}
