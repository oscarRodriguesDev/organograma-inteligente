import Link from 'next/link'
import { listarPerguntasDISC, listarColaboradores, obterResultadoDISC } from '@/lib/db'
import { responderDISCAction } from './actions'

const ROTULOS_NOTA = [
  'Discordo Totalmente',
  'Discordo',
  'Neutro',
  'Concordo',
  'Concordo Totalmente',
]

const INFO_DIMENSAO: Record<string, { label: string; cor: string; desc: string }> = {
  D: {
    label: 'Dominância',
    cor: 'border-l-red-500 bg-red-50',
    desc: 'Pessoas com alta pontuação em D são diretas, firmes e orientadas a resultados. Gostam de desafios e tomar decisões.',
  },
  I: {
    label: 'Influência',
    cor: 'border-l-yellow-500 bg-yellow-50',
    desc: 'Pessoas com alta pontuação em I são comunicativas, entusiasmadas e gostam de interagir com os outros.',
  },
  S: {
    label: 'Estabilidade',
    cor: 'border-l-green-500 bg-green-50',
    desc: 'Pessoas com alta pontuação em S são pacientes, consistentes e valorizam a harmonia no ambiente de trabalho.',
  },
  C: {
    label: 'Conformidade',
    cor: 'border-l-blue-500 bg-blue-50',
    desc: 'Pessoas com alta pontuação em C são analíticas, precisas e seguem regras e procedimentos.',
  },
}

export default async function TesteDISCPage() {
  const [perguntas, colaboradores] = await Promise.all([
    listarPerguntasDISC(),
    listarColaboradores(),
  ])

  const dimensoes = ['D', 'I', 'S', 'C'] as const

  // Tenta obter resultados DISC (para o primeiro colaborador da lista, como preview)
  // Na prática, o resultado será mostrado após selecionar e salvar

  return (
    <div className="flex-1 p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Voltar
        </Link>

        <div className="mt-4 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Teste DISC</h1>
            <p className="text-sm text-zinc-500">
              Avalie as dimensões comportamentais dos colaboradores.
            </p>
          </div>
          <Link
            href="/teste-disc/resultados"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Ver Resultados
          </Link>
        </div>

        {/* Legenda das dimensões */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          {dimensoes.map((dim) => {
            const info = INFO_DIMENSAO[dim]
            return (
              <div key={dim} className={`rounded-lg border-l-4 ${info.cor} p-3`}>
                <h3 className="text-sm font-bold">{dim} — {info.label}</h3>
                <p className="text-xs text-zinc-600">{info.desc}</p>
              </div>
            )
          })}
        </div>

        {/* Formulário de respostas */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">Responder Questionário DISC</h2>
          <form action={responderDISCAction} className="space-y-6 rounded-lg border border-zinc-200 p-6">
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

            <div className="space-y-6">
              {dimensoes.map((dim) => {
                const pergDim = perguntas.filter((p) => p.dimensao === dim)
                if (pergDim.length === 0) return null
                const info = INFO_DIMENSAO[dim]
                return (
                  <div key={dim} className={`rounded-lg border-l-4 ${info.cor} p-4`}>
                    <h3 className="mb-1 text-sm font-bold">
                      {dim} — {info.label}
                    </h3>
                    <div className="space-y-4 mt-3">
                      {pergDim.map((p) => (
                        <div key={p.id}>
                          <p className="mb-2 text-sm font-medium">{p.pergunta}</p>
                          <div className="flex gap-1 sm:gap-2">
                            {[1, 2, 3, 4, 5].map((nota) => (
                              <label
                                key={nota}
                                className="flex flex-1 cursor-pointer flex-col items-center gap-0.5 rounded-lg border border-zinc-200 bg-white p-2 text-xs has-[:checked]:border-black has-[:checked]:bg-zinc-100"
                              >
                                <input
                                  type="radio"
                                  name={`pergunta_${p.id}`}
                                  value={nota}
                                  defaultChecked={nota === 3}
                                  className="sr-only"
                                />
                                <span className="text-sm font-semibold">{nota}</span>
                                <span className="text-[10px] text-zinc-400">{ROTULOS_NOTA[nota - 1]}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Salvar Respostas
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
