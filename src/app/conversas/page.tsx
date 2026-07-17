import Link from 'next/link'
import { listarConversas } from '@/lib/db'
import { excluirConversaAction } from './actions'

const TIPOS: Record<string, string> = {
  '1:1': '1:1',
  feedback: 'Feedback',
  avaliacao: 'Avaliação',
  alinhamento: 'Alinhamento',
  desligamento: 'Desligamento',
  outro: 'Outro',
}

const COR_TIPO: Record<string, string> = {
  '1:1': 'border-l-blue-500',
  feedback: 'border-l-amber-500',
  avaliacao: 'border-l-purple-500',
  alinhamento: 'border-l-green-500',
  desligamento: 'border-l-red-500',
  outro: 'border-l-zinc-400',
}

export default async function ListaConversas() {
  const conversas = await listarConversas()

  return (
    <div className="flex-1 p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Voltar
        </Link>

        <div className="mt-4 mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Conversas</h1>
          <Link
            href="/conversas/nova"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Nova Conversa
          </Link>
        </div>

        {conversas.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center">
            <p className="text-zinc-500">Nenhuma conversa registrada.</p>
            <Link
              href="/conversas/nova"
              className="mt-2 inline-block text-sm font-medium text-black underline"
            >
              Registrar primeira conversa
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {conversas.map((c) => (
              <Link key={c.id} href={`/conversas/${c.id}`}>
                <div
                  className={`rounded-lg border-l-4 border border-zinc-200 ${COR_TIPO[c.tipo] ?? 'border-l-zinc-400'} p-4 transition-colors hover:bg-zinc-50`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-medium">{c.titulo}</h2>
                      <p className="text-sm text-zinc-500">
                        {c.colaboradorNome}
                        <span className="mx-1.5 text-zinc-300">·</span>
                        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600">
                          {TIPOS[c.tipo] ?? c.tipo}
                        </span>
                      </p>
                    </div>
                    <span className="text-xs text-zinc-400">
                      {new Date(c.realizadaEm).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {c.resumo && (
                    <p className="mt-2 text-sm text-zinc-600 line-clamp-2">{c.resumo}</p>
                  )}

                  <form
                    action={excluirConversaAction.bind(null, c.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2"
                  >
                    <button
                      type="submit"
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Excluir
                    </button>
                  </form>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
