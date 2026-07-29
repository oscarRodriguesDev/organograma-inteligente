import Link from 'next/link'
import { buscarProjetoAction } from '../actions'
import { notFound } from 'next/navigation'

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  em_andamento: { label: 'Em andamento', class: 'bg-blue-100 text-blue-700' },
  concluido: { label: 'Concluído', class: 'bg-green-100 text-green-700' },
  pausado: { label: 'Pausado', class: 'bg-yellow-100 text-yellow-700' },
  cancelado: { label: 'Cancelado', class: 'bg-red-100 text-red-700' },
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

function PesoBadge({ peso }: { peso: number }) {
  const colors: Record<number, string> = {
    1: 'bg-zinc-100 text-zinc-600',
    2: 'bg-green-100 text-green-700',
    3: 'bg-yellow-100 text-yellow-700',
    4: 'bg-orange-100 text-orange-700',
    5: 'bg-red-100 text-red-700',
  }
  const labels: Record<number, string> = {
    1: '1 - Mínimo',
    2: '2 - Baixo',
    3: '3 - Médio',
    4: '4 - Alto',
    5: '5 - Máximo',
  }
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${colors[peso] ?? 'bg-zinc-100 text-zinc-600'}`}>
      {labels[peso] ?? peso}
    </span>
  )
}

export default async function DetalhesProjeto({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const projeto = await buscarProjetoAction(id)

  if (!projeto) notFound()

  const statusInfo = STATUS_MAP[projeto.status] ?? {
    label: projeto.status,
    class: 'bg-zinc-100 text-zinc-700',
  }

  return (
    <div className="flex-1 p-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/projetos"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Voltar para Projetos
        </Link>

        <div className="mt-4 mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{projeto.nome}</h1>
            <span
              className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${statusInfo.class}`}
            >
              {statusInfo.label}
            </span>
          </div>
          {projeto.descricao && (
            <p className="mt-2 text-sm text-zinc-600">{projeto.descricao}</p>
          )}
          <div className="mt-3 flex gap-6 text-sm text-zinc-500">
            <span>Início: {formatDate(projeto.dataInicio)}</span>
            <span>Término: {formatDate(projeto.dataFim)}</span>
          </div>
        </div>

        {/* Participantes */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">
            Participantes ({projeto.participantes?.length ?? 0})
          </h2>

          {(!projeto.participantes || projeto.participantes.length === 0) ? (
            <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center">
              <p className="text-sm text-zinc-500">
                Nenhum participante registrado neste projeto.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-zinc-600">Colaborador</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-600">Responsabilidade</th>
                    <th className="px-4 py-3 text-center font-medium text-zinc-600">Peso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {projeto.participantes.map((pp) => (
                    <tr key={pp.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {pp.colaborador?.fotoUrl ? (
                            <img
                              src={pp.colaborador.fotoUrl}
                              alt=""
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-600">
                              {pp.colaborador?.nome?.charAt(0) ?? '?'}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{pp.colaborador?.nome ?? 'Desconhecido'}</p>
                            <p className="text-xs text-zinc-500">{pp.colaborador?.funcao ?? ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {pp.responsabilidade}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <PesoBadge peso={pp.peso} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
