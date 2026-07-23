import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { Papel } from '@/lib/types'
import { redirect } from 'next/navigation'
import { listarTestesAction } from '@/lib/admin-psich-actions'
import { AlternarStatusButton } from './alternar-status-button'
import { ExcluirTesteButton } from './excluir-teste-button'

export default async function TestesPsicologicosPage() {
  const session = await getSession()
  if (!session || session.papel !== Papel.ADMIN_PSICH) {
    redirect('/login')
  }

  const testes = await listarTestesAction()

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Testes Psicológicos</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Crie e gerencie testes psicológicos disponíveis para as empresas
          </p>
        </div>
        <Link
          href="/admin/testes-psicologicos/novo"
          className="px-4 py-2.5 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          + Novo Teste
        </Link>
      </div>

      {testes.length === 0 ? (
        <div className="text-center py-20 text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-lg font-medium">Nenhum teste criado ainda</p>
          <p className="text-sm mt-1 mb-6">Crie seu primeiro teste psicológico para disponibilizar às empresas</p>
          <Link
            href="/admin/testes-psicologicos/novo"
            className="inline-block px-4 py-2.5 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Criar Primeiro Teste
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {testes.map((teste) => (
            <div
              key={teste.id}
              className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <Link href={`/admin/testes-psicologicos/${teste.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-semibold text-foreground truncate">{teste.titulo}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      teste.ativo
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                    }`}>
                      {teste.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  {teste.descricao && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-2">
                      {teste.descricao}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500">
                    <span>{teste.perguntas?.length ?? 0} perguntas</span>
                    <span>Tipo: {teste.tipo}</span>
                    <span>Criado por {teste.criadoPorNome}</span>
                    <span>{new Date(teste.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </Link>
                <div className="flex items-center gap-2 shrink-0">
                  <AlternarStatusButton
                    testeId={teste.id}
                    ativo={teste.ativo}
                  />
                  <Link
                    href={`/admin/testes-psicologicos/${teste.id}`}
                    className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Editar
                  </Link>
                  <ExcluirTesteButton testeId={teste.id} testeNome={teste.titulo} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
