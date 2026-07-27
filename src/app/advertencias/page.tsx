import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { listarAdvertenciasAction } from './actions'

const TIPO_CORES: Record<string, string> = {
  leve: 'bg-yellow-100 text-yellow-800',
  media: 'bg-orange-100 text-orange-800',
  grave: 'bg-red-100 text-red-800',
}

const TIPO_LABELS: Record<string, string> = {
  leve: 'Leve',
  media: 'Média',
  grave: 'Grave',
}

export default async function ListaAdvertencias() {
  const session = await getSession()
  if (!session) redirect('/login')

  const isGestor = ['CEO', 'DIRETOR', 'GERENTE', 'SUPERVISOR', 'GESTOR', 'LIDER', 'RH', 'ADMIN_PLATAFORMA', 'ADMIN_SUPORTE'].includes(session.papel)
  const advertencias = await listarAdvertenciasAction()

  return (
    <div className="flex-1 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Advertências</h1>
          {isGestor && (
            <Link
              href="/advertencias/nova"
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Nova Advertência
            </Link>
          )}
        </div>

        {advertencias.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center">
            <p className="text-zinc-500">Nenhuma advertência registrada.</p>
            {isGestor && (
              <Link
                href="/advertencias/nova"
                className="mt-2 inline-block text-sm font-medium text-black underline"
              >
                Aplicar primeira advertência
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Data</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Colaborador</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Título</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">Aplicado por</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {advertencias.map((adv) => (
                  <tr key={adv.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">
                      {new Date(adv.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 font-medium">{adv.colaboradorNome ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-700">{adv.titulo}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                          TIPO_CORES[adv.tipo] ?? 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {TIPO_LABELS[adv.tipo] ?? adv.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{adv.aplicadaPorNome ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {advertencias.length > 0 && (
          <p className="mt-4 text-xs text-zinc-400 text-right">
            Total: {advertencias.length} advertência{advertencias.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  )
}
