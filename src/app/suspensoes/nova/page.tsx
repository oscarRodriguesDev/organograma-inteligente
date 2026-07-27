import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { listarSubordinadosAction, criarSuspensaoAction } from '../actions'

export default async function NovaSuspensao() {
  const session = await getSession()
  if (!session) redirect('/login')

  const isGestor = ['CEO', 'DIRETOR', 'GERENTE', 'SUPERVISOR', 'GESTOR', 'LIDER', 'RH', 'ADMIN_PLATAFORMA', 'ADMIN_SUPORTE'].includes(session.papel)
  if (!isGestor) redirect('/suspensoes')

  const subordinados = await listarSubordinadosAction()

  return (
    <div className="flex-1 p-8">
      <div className="max-w-lg mx-auto">
        <Link
          href="/suspensoes"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Voltar
        </Link>

        <h1 className="mt-4 mb-8 text-2xl font-bold">Nova Suspensão</h1>

        <form action={criarSuspensaoAction} className="space-y-5">
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
            <label htmlFor="motivo" className="mb-1 block text-sm font-medium">
              Motivo
            </label>
            <textarea
              id="motivo"
              name="motivo"
              rows={4}
              required
              maxLength={500}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Descreva o motivo da suspensão..."
            />
          </div>

          <div>
            <label htmlFor="dataInicio" className="mb-1 block text-sm font-medium">
              Data de Início
            </label>
            <input
              id="dataInicio"
              name="dataInicio"
              type="date"
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="dataFim" className="mb-1 block text-sm font-medium">
              Data de Fim <span className="text-zinc-400">(opcional)</span>
            </label>
            <input
              id="dataFim"
              name="dataFim"
              type="date"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="observacao" className="mb-1 block text-sm font-medium">
              Observação <span className="text-zinc-400">(opcional)</span>
            </label>
            <textarea
              id="observacao"
              name="observacao"
              rows={3}
              maxLength={2000}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Observações adicionais..."
            />
          </div>

          <button
            type="submit"
            disabled={subordinados.length === 0}
            className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            Aplicar Suspensão
          </button>
        </form>
      </div>
    </div>
  )
}
