import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { listarSuspensoesAction } from './actions'

export default async function ListaSuspensoes() {
  const session = await getSession()
  if (!session) redirect('/login')

  const isGestor = ['CEO', 'DIRETOR', 'GERENTE', 'SUPERVISOR', 'GESTOR', 'LIDER', 'RH', 'ADMIN_PLATAFORMA', 'ADMIN_SUPORTE'].includes(session.papel)
  const suspensoes = await listarSuspensoesAction()

  return (
    <div className="flex-1 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Suspensões</h1>
          {isGestor && (
            <Link
              href="/suspensoes/nova"
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Nova Suspensão
            </Link>
          )}
        </div>

        {suspensoes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center">
            <p className="text-zinc-500">Nenhuma suspensão registrada.</p>
            {isGestor && (
              <Link
                href="/suspensoes/nova"
                className="mt-2 inline-block text-sm font-medium text-black underline"
              >
                Aplicar primeira suspensão
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Data Início</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Data Fim</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Colaborador</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Motivo</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Aplicado por</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {suspensoes.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">
                      {new Date(s.dataInicio).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">
                      {s.dataFim ? new Date(s.dataFim).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium">{s.colaboradorNome ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-700 max-w-xs truncate">{s.motivo}</td>
                    <td className="px-4 py-3 text-zinc-600">{s.aplicadaPorNome ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {suspensoes.length > 0 && (
          <p className="mt-4 text-xs text-zinc-400 text-right">
            Total: {suspensoes.length} suspensão{suspensoes.length !== 1 ? 'ões' : ''}
          </p>
        )}
      </div>
    </div>
  )
}
