import Link from 'next/link'
import { criarAvaliacaoAction } from '@/lib/actions'
import { listarColaboradores } from '@/lib/db'
import { CRITERIOS_AVALIACAO, type CriterioNota } from '@/lib/types'

export default async function NovaAvaliacao() {
  const colaboradores = await listarColaboradores()

  return (
    <div className="flex-1 p-8">
      <div className="max-w-xl mx-auto">
        <Link
          href="/avaliacoes"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Voltar
        </Link>

        <h1 className="mt-4 mb-8 text-2xl font-bold">Nova Avaliação</h1>

        <form action={criarAvaliacaoAction} className="space-y-5">
          <div>
            <label htmlFor="avaliadorId" className="mb-1 block text-sm font-medium">
              Avaliador (líder)
            </label>
            <select
              id="avaliadorId"
              name="avaliadorId"
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            >
              <option value="">Selecione o líder</option>
              {colaboradores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} — {c.funcao}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="avaliadoId" className="mb-1 block text-sm font-medium">
              Avaliado (liderado)
            </label>
            <select
              id="avaliadoId"
              name="avaliadoId"
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

          <div className="border-t border-zinc-200 pt-5">
            <h2 className="text-sm font-semibold mb-4">Critérios de Avaliação</h2>
            <div className="space-y-4">
              {CRITERIOS_AVALIACAO.map((criterio) => (
                <div key={criterio}>
                  <label
                    htmlFor={`nota_${criterio}`}
                    className="mb-1 block text-sm font-medium"
                  >
                    {criterio}
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((nota) => (
                      <label
                        key={nota}
                        className="flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-lg border border-zinc-200 p-2 text-xs has-[:checked]:border-black has-[:checked]:bg-zinc-50"
                      >
                        <input
                          type="radio"
                          name={`nota_${criterio}`}
                          value={nota}
                          defaultChecked={nota === 3}
                          className="sr-only"
                        />
                        <span className="text-sm font-semibold">{nota}</span>
                        <span className="text-zinc-400">
                          {nota <= 1
                            ? 'Ruim'
                            : nota === 2
                              ? 'Regular'
                              : nota === 3
                                ? 'Bom'
                                : nota === 4
                                  ? 'Ótimo'
                                  : 'Excelente'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="comentarioGeral" className="mb-1 block text-sm font-medium">
              Comentário Geral
            </label>
            <textarea
              id="comentarioGeral"
              name="comentarioGeral"
              rows={4}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Observações sobre o desempenho..."
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Registrar Avaliação
          </button>
        </form>
      </div>
    </div>
  )
}
