import Link from 'next/link'
import { listarEmpresas } from '@/lib/admin-actions'
import { AlternarStatusEmpresaButton } from './alternar-status-button'
import { ExcluirEmpresaButton } from './excluir-empresa-button'

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR')
}

export default async function AdminEmpresasPage() {
  const empresas = await listarEmpresas()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Empresas</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Gerencie todas as empresas da plataforma
        </p>
      </div>

      {empresas.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 dark:text-zinc-500">
          <p className="text-lg">Nenhuma empresa cadastrada ainda.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Empresa</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Slug</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Contato</th>
                  <th className="text-center px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Plano</th>
                  <th className="text-center px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Colabs</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Desde</th>
                  <th className="text-right px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {empresas.map((emp) => (
                  <tr key={emp.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/empresas/${emp.id}`}
                        className="font-medium text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {emp.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                      {emp.slug}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-foreground">{emp.contatoNome || '—'}</div>
                      {emp.contatoEmail && (
                        <div className="text-xs text-zinc-400 dark:text-zinc-500">{emp.contatoEmail}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                          emp.ativa
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                        }`}
                      >
                        {emp.ativa ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {emp.assinatura?.plano?.nome ?? 'Sem plano'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-zinc-600 dark:text-zinc-400">
                      {emp.totalColaboradores}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                      {formatarData(emp.dataContratacao)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <AlternarStatusEmpresaButton
                          empresaId={emp.id}
                          ativa={emp.ativa}
                        />
                        <Link
                          href={`/admin/empresas/${emp.id}`}
                          className="text-xs px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                          Detalhes
                        </Link>
                        <ExcluirEmpresaButton
                          empresaId={emp.id}
                          empresaNome={emp.nome}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
