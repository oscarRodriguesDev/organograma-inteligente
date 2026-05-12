import Link from 'next/link'
import { listarColaboradores } from '@/lib/db'
import { excluirColaborador } from '@/lib/actions'

export default function ListaColaboradores() {
  const colaboradores = listarColaboradores()

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Colaboradores</h1>
          <Link
            href="/colaboradores/novo"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Novo Colaborador
          </Link>
        </div>

        {colaboradores.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center">
            <p className="text-zinc-500">Nenhum colaborador cadastrado.</p>
            <Link
              href="/colaboradores/novo"
              className="mt-2 inline-block text-sm font-medium text-black underline"
            >
              Cadastrar primeiro colaborador
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-200">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Nome</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Função</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Líder Imediato</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {colaboradores.map((col) => {
                  const lider = colaboradores.find((c) => c.id === col.liderImediatoId)
                  return (
                    <tr key={col.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 font-medium">{col.nome}</td>
                      <td className="px-4 py-3 text-zinc-600">{col.funcao}</td>
                      <td className="px-4 py-3 text-zinc-600">
                        {lider ? lider.nome : <span className="text-zinc-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <form
                          action={async () => {
                            'use server'
                            await excluirColaborador(col.id)
                          }}
                        >
                          <button
                            type="submit"
                            className="text-sm text-red-600 hover:text-red-800"
                          >
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
