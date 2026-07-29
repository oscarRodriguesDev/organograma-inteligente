import Link from 'next/link'
import { listarProjetosAction, atualizarStatusProjetoAction } from './actions'

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

export default async function ListaProjetos() {
  const projetos = await listarProjetosAction()

  return (
    <div className="flex-1 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Projetos</h1>
          <Link
            href="/projetos/novo"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Novo Projeto
          </Link>
        </div>

        {projetos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center">
            <p className="text-zinc-500">Nenhum projeto registrado.</p>
            <Link
              href="/projetos/novo"
              className="mt-2 inline-block text-sm font-medium text-black underline"
            >
              Registrar primeiro projeto
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Nome</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Data Início</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Data Fim</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {projetos.map((projeto) => {
                  const statusInfo = STATUS_MAP[projeto.status] ?? {
                    label: projeto.status,
                    class: 'bg-zinc-100 text-zinc-700',
                  }
                  return (
                    <tr key={projeto.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/projetos/${projeto.id}`} className="hover:underline">
                          {projeto.nome}
                        </Link>
                        {projeto.descricao && (
                          <div className="mt-0.5 text-xs text-zinc-400 line-clamp-1">
                            {projeto.descricao}
                          </div>
                        )}
                        {projeto.participantes && projeto.participantes.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {projeto.participantes.slice(0, 3).map((pp) => (
                              <span
                                key={pp.id}
                                className="inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600"
                              >
                                {pp.colaborador?.nome?.split(' ')[0]}
                              </span>
                            ))}
                            {projeto.participantes.length > 3 && (
                              <span className="text-[10px] text-zinc-400">
                                +{projeto.participantes.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${statusInfo.class}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {formatDate(projeto.dataInicio)}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {formatDate(projeto.dataFim)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/projetos/${projeto.id}`}
                            className="text-xs text-zinc-600 hover:text-zinc-800"
                          >
                            Detalhes
                          </Link>
                          {projeto.status !== 'concluido' && projeto.status !== 'cancelado' && (
                            <form
                              action={atualizarStatusProjetoAction.bind(
                                null,
                                projeto.id,
                                projeto.status === 'em_andamento' ? 'concluido' : 'em_andamento'
                              )}
                            >
                              <button
                                type="submit"
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                {projeto.status === 'em_andamento' ? 'Concluir' : 'Reabrir'}
                              </button>
                            </form>
                          )}
                        </div>
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
