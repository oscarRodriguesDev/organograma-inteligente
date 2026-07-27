import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { listarSubordinadosAction, criarAdvertenciaAction } from '../actions'

export default async function NovaAdvertencia() {
  const session = await getSession()
  if (!session) redirect('/login')

  const isGestor = ['CEO', 'DIRETOR', 'GERENTE', 'SUPERVISOR', 'GESTOR', 'LIDER', 'RH', 'ADMIN_PLATAFORMA', 'ADMIN_SUPORTE'].includes(session.papel)
  if (!isGestor) redirect('/advertencias')

  const subordinados = await listarSubordinadosAction()

  return (
    <div className="flex-1 p-8">
      <div className="max-w-lg mx-auto">
        <Link
          href="/advertencias"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Voltar
        </Link>

        <h1 className="mt-4 mb-8 text-2xl font-bold">Nova Advertência</h1>

        <form action={criarAdvertenciaAction} className="space-y-5">
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
              <option value="">Selecione o subordinado</option>
              {subordinados.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} — {s.funcao}
                </option>
              ))}
            </select>
            {subordinados.length === 0 && (
              <p className="mt-1 text-xs text-zinc-400">
                Nenhum subordinado encontrado.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="titulo" className="mb-1 block text-sm font-medium">
              Título
            </label>
            <input
              id="titulo"
              name="titulo"
              type="text"
              required
              maxLength={200}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Ex: Atraso recorrente"
            />
          </div>

          <div>
            <label htmlFor="descricao" className="mb-1 block text-sm font-medium">
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              rows={4}
              maxLength={2000}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Detalhe o motivo da advertência..."
            />
          </div>

          <div>
            <label htmlFor="tipo" className="mb-1 block text-sm font-medium">
              Tipo
            </label>
            <select
              id="tipo"
              name="tipo"
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            >
              <option value="">Selecione o tipo</option>
              <option value="leve">Leve</option>
              <option value="media">Média</option>
              <option value="grave">Grave</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={subordinados.length === 0}
            className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            Aplicar Advertência
          </button>
        </form>
      </div>
    </div>
  )
}
