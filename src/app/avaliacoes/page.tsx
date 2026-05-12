import Link from 'next/link'
import { listarAvaliacoes } from '@/lib/db'
import { listarColaboradores } from '@/lib/db'
import { excluirAvaliacaoAction } from './actions'

export default function ListaAvaliacoes() {
  const avaliacoes = listarAvaliacoes()
  const colaboradores = listarColaboradores()

  function nomeColaborador(id: string) {
    return colaboradores.find((c) => c.id === id)?.nome || 'Desconhecido'
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Avaliações</h1>
          <Link
            href="/avaliacoes/nova"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Nova Avaliação
          </Link>
        </div>

        {avaliacoes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center">
            <p className="text-zinc-500">Nenhuma avaliação registrada.</p>
            <Link
              href="/avaliacoes/nova"
              className="mt-2 inline-block text-sm font-medium text-black underline"
            >
              Criar primeira avaliação
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {avaliacoes.toReversed().map((av) => {
              const media =
                av.criterios.reduce((s, c) => s + c.nota, 0) / av.criterios.length
              return (
                <div key={av.id} className="rounded-lg border border-zinc-200 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm text-zinc-500">
                        <span className="font-medium text-zinc-800">{nomeColaborador(av.avaliadorId)}</span>
                        {' avaliou '}
                        <span className="font-medium text-zinc-800">{nomeColaborador(av.avaliadoId)}</span>
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {new Date(av.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      Média: {media.toFixed(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                    {av.criterios.map((c) => (
                      <div
                        key={c.criterio}
                        className="flex items-center justify-between rounded bg-zinc-50 px-3 py-1.5 text-sm"
                      >
                        <span className="text-zinc-600">{c.criterio}</span>
                        <span className="font-medium">{c.nota}/5</span>
                      </div>
                    ))}
                  </div>

                  {av.comentarioGeral && (
                    <p className="text-sm text-zinc-600 italic">{av.comentarioGeral}</p>
                  )}

                  <form action={excluirAvaliacaoAction.bind(null, av.id)} className="mt-3">
                    <button
                      type="submit"
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Excluir
                    </button>
                  </form>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
