import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { listarTestesDisponiveisEmpresa } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function TestesPage() {
  const session = await getSession()
  if (!session || !session.empresaId) {
    redirect('/login')
  }

  const testesDisponiveis = await listarTestesDisponiveisEmpresa(session.empresaId)

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Testes Disponíveis</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Testes disponíveis para sua empresa
          </p>
        </div>

        {testesDisponiveis.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-lg font-medium text-foreground">Nenhum teste disponível</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Seu gestor pode atribuir testes a você através de um link exclusivo
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {testesDisponiveis.map((teste) => (
              <Link
                key={teste.id}
                href={`/testes/${teste.id}`}
                className="block bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 hover:shadow-sm transition-shadow"
              >
                <h3 className="text-sm font-semibold text-foreground truncate">{teste.titulo}</h3>
                {teste.descricao && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{teste.descricao}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-400 dark:text-zinc-500">
                  <span>{teste.perguntas?.length ?? 0} perguntas</span>
                  <span>{teste.tipo}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <span className="font-semibold">💡 Importante:</span> Seu gestor pode enviar um link exclusivo para você responder a um teste específico.
            Esse link não exige login e só pode ser usado uma vez.
          </p>
        </div>
      </div>
    </div>
  )
}
