import Link from 'next/link'
import { listarIniciativas } from '@/lib/db'
import { listarColaboradores } from '@/lib/db'

import { excluirIniciativaAction } from './actions'

export default async function ListaIniciativas() {
  const [iniciativas, colaboradores] = await Promise.all([
    listarIniciativas(),
    listarColaboradores(),
  ])

  function nomeColaborador(id: string) {
    return colaboradores.find((c) => c.id === id)?.nome || 'Desconhecido'
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Iniciativas</h1>
          <Link
            href="/iniciativas/nova"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Nova Iniciativa
          </Link>
        </div>

        {iniciativas.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center">
            <p className="text-zinc-500">Nenhuma iniciativa registrada.</p>
            <Link
              href="/iniciativas/nova"
              className="mt-2 inline-block text-sm font-medium text-black underline"
            >
              Registrar primeira iniciativa
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {iniciativas.toReversed().map((iniciativa) => (
              <div key={iniciativa.id} className="rounded-lg border border-zinc-200 p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{iniciativa.titulo}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {nomeColaborador(iniciativa.colaboradorId)} — {new Date(iniciativa.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <form action={excluirIniciativaAction.bind(null, iniciativa.id)}>
                    <button type="submit" className="text-xs text-red-500 hover:text-red-700">
                      Excluir
                    </button>
                  </form>
                </div>
                {iniciativa.descricao && (
                  <p className="text-sm text-zinc-600 mb-2">{iniciativa.descricao}</p>
                )}
                {iniciativa.valorResultado > 0 && (
                  <div className="mb-2 inline-block rounded bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-800">
                    {iniciativa.valorResultado.toLocaleString('pt-BR')} {iniciativa.unidadeMedida}
                  </div>
                )}
                {iniciativa.resultado && (
                  <div className="rounded bg-green-50 px-3 py-2 text-sm text-green-800">
                    <span className="font-medium">Resultado:</span> {iniciativa.resultado}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
