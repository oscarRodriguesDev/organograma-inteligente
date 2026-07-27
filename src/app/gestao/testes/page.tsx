import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { Papel } from '@/lib/types'
import { redirect } from 'next/navigation'
import {
  listarTestesAtivosParaEmpresa,
  listarAtribuicoesDaEmpresa,
} from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function GestaoTestesPage() {
  const session = await getSession()
  if (!session || !session.empresaId) redirect('/login')

  // Permite: GESTOR, SUPERVISOR, GERENTE, DIRETOR, CEO, RH
  const papeisPermitidos = [Papel.GESTOR, Papel.SUPERVISOR, Papel.GERENTE, Papel.DIRETOR, Papel.CEO, Papel.RH, Papel.ADMIN_PLATAFORMA, Papel.ADMIN_SUPORTE]
  if (!papeisPermitidos.includes(session.papel as Papel)) {
    redirect('/')
  }

  const testesDisponiveis = await listarTestesAtivosParaEmpresa(session.empresaId)
  const atribuicoes = await listarAtribuicoesDaEmpresa(session.empresaId)

  return (
    <div className="flex-1 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Gestão de Testes</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Atribua testes psicológicos e comportamentais aos colaboradores da sua empresa
          </p>
        </div>

        {/* Grid: Testes Disponíveis + Últimas Atribuições */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Card: Testes Disponíveis */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
            <h2 className="text-base font-semibold text-foreground mb-4">Testes Disponíveis</h2>

            {testesDisponiveis.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 dark:text-zinc-500">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-sm">Nenhum teste disponível no momento</p>
                <p className="text-xs mt-1">
                  Os testes são criados pelo administrador da plataforma
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {testesDisponiveis.map((teste) => (
                  <div
                    key={teste.id}
                    className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-foreground truncate">
                          {teste.titulo}
                        </h3>
                        {teste.descricao && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                            {teste.descricao}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-400 dark:text-zinc-500">
                          <span>{teste.perguntas?.length ?? 0} perguntas</span>
                          <span>{teste.tipo}</span>
                        </div>
                      </div>
                      <Link
                        href={`/gestao/testes/${teste.id}/atribuir`}
                        className="shrink-0 px-3 py-1.5 text-xs font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                      >
                        Atribuir
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card: Últimas Atribuições */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
            <h2 className="text-base font-semibold text-foreground mb-4">Últimas Atribuições</h2>

            {atribuicoes.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 dark:text-zinc-500">
                <p className="text-3xl mb-2">📤</p>
                <p className="text-sm">Nenhum teste atribuído ainda</p>
                <p className="text-xs mt-1">
                  Escolha um teste ao lado e atribua aos colaboradores
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {atribuicoes.slice(0, 20).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">
                        {a.colaboradorNome}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {a.testeTitulo}
                      </p>
                    </div>
                    <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      a.status === 'concluido'
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                    }`}>
                      {a.status === 'concluido' ? 'Concluído' : 'Pendente'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabela completa de atribuições */}
        {atribuicoes.length > 0 && (
          <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-base font-semibold text-foreground">
                Histórico Completo ({atribuicoes.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Colaborador</th>
                    <th className="px-5 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Função</th>
                    <th className="px-5 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Teste</th>
                    <th className="px-5 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Atribuído por</th>
                    <th className="px-5 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Data</th>
                    <th className="px-5 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Status</th>
                    <th className="px-5 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {atribuicoes.map((a) => {
                    const link = `${(process.env.NEXT_PUBLIC_URL || 'http://localhost:3000').replace(/\/$/, '')}/responder/${a.token}`
                    return (
                    <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="px-5 py-3 font-medium text-foreground">{a.colaboradorNome}</td>
                      <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">{a.colaboradorFuncao}</td>
                      <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">{a.testeTitulo}</td>
                      <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">{a.atribuidoPorNome}</td>
                      <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                        {new Date(a.atribuidoEm).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          a.status === 'concluido'
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                        }`}>
                          {a.status === 'concluido' ? 'Concluído' : 'Pendente'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {a.status === 'pendente' ? (
                          <a
                            href={link}
                            target="_blank"
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate block max-w-[200px]"
                          >
                            {link}
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
