import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { buscarColaborador, listarColaboradores, listarCargos } from '@/lib/db'
import { editarColaboradorAction } from '@/lib/actions'

export default async function EditarColaborador({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params
  const colaborador = await buscarColaborador(id)
  if (!colaborador) notFound()

  const todos = await listarColaboradores()
  const possiveisLideres = todos.filter(
    (c) => c.id !== id && c.status !== 'vago'
  )
  const cargos = await listarCargos()

  return (
    <div className="flex-1 p-8">
      <div className="max-w-lg mx-auto">
        <Link
          href="/colaboradores"
          className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          ← Voltar
        </Link>

        <h1 className="mt-4 mb-8 text-2xl font-bold text-foreground">
          Editar Colaborador
        </h1>

        <form action={editarColaboradorAction} className="space-y-5">
          <input type="hidden" name="id" value={colaborador.id} />

          <div>
            <label htmlFor="nome" className="mb-1 block text-sm font-medium">
              Nome
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              required
              maxLength={120}
              defaultValue={colaborador.nome}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              placeholder="Nome completo"
            />
          </div>

          <div>
            <label htmlFor="funcao" className="mb-1 block text-sm font-medium">
              Função (Cargo)
            </label>
            <select
              id="funcao"
              name="funcao"
              required
              defaultValue={colaborador.funcao}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
            >
              <option value="">Selecione o cargo</option>
              {cargos.map((c) => (
                <option key={c.id} value={c.nome}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="liderImediatoId" className="mb-1 block text-sm font-medium">
              Líder Imediato
            </label>
            <select
              id="liderImediatoId"
              name="liderImediatoId"
              defaultValue={colaborador.liderImediatoId ?? ''}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
            >
              <option value="">Nenhum (é líder máximo)</option>
              {possiveisLideres.map((lider) => (
                <option key={lider.id} value={lider.id}>
                  {lider.nome} — {lider.funcao}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Link
              href="/colaboradores"
              className="flex-1 text-center rounded-lg border border-zinc-300 dark:border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-black dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
