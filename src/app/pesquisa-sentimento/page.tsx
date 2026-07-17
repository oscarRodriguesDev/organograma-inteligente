import Link from 'next/link'
import { listarColaboradores, listarPesquisasSentimento } from '@/lib/db'
import { registrarSentimentoAction } from './actions'

const SENTIMENTOS = [
  { valor: 'muito_positivo', rotulo: 'Muito Positivo', emoji: '😄' },
  { valor: 'positivo', rotulo: 'Positivo', emoji: '🙂' },
  { valor: 'neutro', rotulo: 'Neutro', emoji: '😐' },
  { valor: 'negativo', rotulo: 'Negativo', emoji: '😟' },
  { valor: 'muito_negativo', rotulo: 'Muito Negativo', emoji: '😢' },
] as const

const COR_SENTIMENTO: Record<string, string> = {
  muito_positivo: 'border-l-green-500',
  positivo: 'border-l-emerald-400',
  neutro: 'border-l-zinc-400',
  negativo: 'border-l-orange-400',
  muito_negativo: 'border-l-red-500',
}

export default async function PesquisaSentimentoPage() {
  const [colaboradores, pesquisas] = await Promise.all([
    listarColaboradores(),
    listarPesquisasSentimento(),
  ])

  return (
    <div className="flex-1 p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Voltar
        </Link>

        <h1 className="mt-4 mb-2 text-2xl font-bold">Pesquisa de Sentimento</h1>
        <p className="mb-8 text-sm text-zinc-500">
          Registre como o colaborador se sente em relação ao trabalho e ao ambiente.
        </p>

        {/* Formulário */}
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold">Registrar Pesquisa</h2>
          <form action={registrarSentimentoAction} className="space-y-5 rounded-lg border border-zinc-200 p-6">
            <div>
              <label htmlFor="colaboradorId" className="mb-1 block text-sm font-medium">
                Colaborador
              </label>
              <select
                id="colaboradorId"
                name="colaboradorId"
                required
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              >
                <option value="">Selecione o colaborador</option>
                {colaboradores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} — {c.funcao}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Sentimento Geral</label>
              <div className="flex gap-2">
                {SENTIMENTOS.map((s) => (
                  <label
                    key={s.valor}
                    className="flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-lg border border-zinc-200 p-3 text-xs has-[:checked]:border-black has-[:checked]:bg-zinc-50"
                  >
                    <input
                      type="radio"
                      name="sentimento"
                      value={s.valor}
                      required
                      className="sr-only"
                    />
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="font-medium text-zinc-700">{s.rotulo}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="nota" className="mb-1 block text-sm font-medium">
                Nota Geral (1-5)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <label
                    key={n}
                    className="flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-lg border border-zinc-200 p-2 text-xs has-[:checked]:border-black has-[:checked]:bg-zinc-50"
                  >
                    <input
                      type="radio"
                      name="nota"
                      value={n}
                      defaultChecked={n === 3}
                      className="sr-only"
                    />
                    <span className="text-sm font-semibold">{n}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="engajamento" className="mb-1 block text-sm font-medium">
                  Engajamento (1-5) <span className="text-zinc-400">opcional</span>
                </label>
                <select
                  id="engajamento"
                  name="engajamento"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
                >
                  <option value="">—</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="motivacao" className="mb-1 block text-sm font-medium">
                  Motivação (1-5) <span className="text-zinc-400">opcional</span>
                </label>
                <select
                  id="motivacao"
                  name="motivacao"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
                >
                  <option value="">—</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="pertencimento" className="mb-1 block text-sm font-medium">
                  Pertencimento (1-5) <span className="text-zinc-400">opcional</span>
                </label>
                <select
                  id="pertencimento"
                  name="pertencimento"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
                >
                  <option value="">—</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="comentario" className="mb-1 block text-sm font-medium">
                Comentário <span className="text-zinc-400">opcional</span>
              </label>
              <textarea
                id="comentario"
                name="comentario"
                rows={3}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
                placeholder="Observações sobre o sentimento do colaborador..."
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Registrar Pesquisa
            </button>
          </form>
        </section>

        {/* Histórico */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">Pesquisas Anteriores</h2>
          {pesquisas.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center">
              <p className="text-zinc-500">Nenhuma pesquisa registrada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pesquisas.map((p) => {
                const s = SENTIMENTOS.find((s) => s.valor === p.sentimento)
                return (
                  <div
                    key={p.id}
                    className={`rounded-lg border-l-4 border border-zinc-200 ${COR_SENTIMENTO[p.sentimento] ?? 'border-l-zinc-400'} p-4`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{s?.emoji}</span>
                        <span className="font-medium">{p.colaboradorNome}</span>
                        <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                          Nota: {p.nota}/5
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400">
                        {new Date(p.respondidoEm).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <div className="mt-2 flex gap-3 text-xs text-zinc-500">
                      {p.engajamento && <span>Engajamento: {p.engajamento}/5</span>}
                      {p.motivacao && <span>Motivação: {p.motivacao}/5</span>}
                      {p.pertencimento && <span>Pertencimento: {p.pertencimento}/5</span>}
                    </div>

                    {p.comentario && (
                      <p className="mt-2 text-sm text-zinc-600 italic">&ldquo;{p.comentario}&rdquo;</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
