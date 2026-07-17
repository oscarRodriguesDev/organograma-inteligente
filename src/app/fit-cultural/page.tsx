import Link from 'next/link'
import { listarPerguntasFitCultural, listarColaboradores } from '@/lib/db'
import { responderFitCulturalAction } from './actions'

const ROTULOS_NOTA = [
  'Discordo Totalmente',
  'Discordo',
  'Neutro',
  'Concordo',
  'Concordo Totalmente',
]

const COR_DIMENSAO: Record<string, string> = {
  valores: 'border-l-blue-500',
  comportamento: 'border-l-amber-500',
  comunicacao: 'border-l-green-500',
  lideranca: 'border-l-purple-500',
  inovacao: 'border-l-rose-500',
}

export default async function FitCulturalPage() {
  const [perguntas, colaboradores] = await Promise.all([
    listarPerguntasFitCultural(),
    listarColaboradores(),
  ])

  const dimensoes = [...new Set(perguntas.map((p) => p.dimensao))]

  return (
    <div className="flex-1 p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Voltar
        </Link>

        <h1 className="mt-4 mb-2 text-2xl font-bold">Teste Fit Cultural</h1>
        <p className="mb-8 text-sm text-zinc-500">
          Avalie o alinhamento dos colaboradores com a cultura da empresa.
        </p>

        {/* Tabela de perguntas */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">Perguntas Cadastradas</h2>
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Pergunta</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Dimensão</th>
                  <th className="px-4 py-3 text-center font-medium text-zinc-600">Peso</th>
                  <th className="px-4 py-3 text-center font-medium text-zinc-600">Ordem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {perguntas.map((p) => (
                  <tr key={p.id} className={`border-l-4 ${COR_DIMENSAO[p.dimensao] ?? 'border-l-zinc-300'}`}>
                    <td className="px-4 py-3">{p.pergunta}</td>
                    <td className="px-4 py-3 text-zinc-600 capitalize">{p.dimensao}</td>
                    <td className="px-4 py-3 text-center">{p.peso}</td>
                    <td className="px-4 py-3 text-center text-zinc-400">{p.ordem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Formulário de respostas */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">Responder Questionário</h2>
          <form action={responderFitCulturalAction} className="space-y-6 rounded-lg border border-zinc-200 p-6">
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
              {dimensoes.map((dimensao) => {
                const pergDim = perguntas.filter((p) => p.dimensao === dimensao)
                if (pergDim.length === 0) return null
                return (
                  <div key={dimensao} className={`rounded-lg border-l-4 ${COR_DIMENSAO[dimensao] ?? 'border-l-zinc-300'} bg-zinc-50 p-4`}>
                    <h3 className="mb-3 text-sm font-semibold capitalize text-zinc-700">{dimensao}</h3>
                    <div className="space-y-4">
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
