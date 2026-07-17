import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buscarConversa } from '@/lib/db'
import { excluirConversaAction } from '../actions'

const TIPOS: Record<string, string> = {
  '1:1': '1:1',
  feedback: 'Feedback',
  avaliacao: 'Avaliação',
  alinhamento: 'Alinhamento',
  desligamento: 'Desligamento',
  outro: 'Outro',
}

export default async function DetalheConversa(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const conversa = await buscarConversa(id)

  if (!conversa) {
    notFound()
  }

  return (
    <div className="flex-1 p-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/conversas"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Todas as Conversas
        </Link>

        <div className="mt-4 mb-8">
          <h1 className="text-2xl font-bold">{conversa.titulo}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {conversa.colaboradorNome}
            <span className="mx-1.5 text-zinc-300">·</span>
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600">
              {TIPOS[conversa.tipo] ?? conversa.tipo}
            </span>
            <span className="mx-1.5 text-zinc-300">·</span>
            <span>{new Date(conversa.realizadaEm).toLocaleDateString('pt-BR')}</span>
          </p>
        </div>

        {conversa.assunto && (
          <section className="mb-6">
            <h2 className="mb-2 text-sm font-semibold text-zinc-600">Assunto</h2>
            <p className="text-sm text-zinc-800">{conversa.assunto}</p>
          </section>
        )}

        {conversa.resumo && (
          <section className="mb-6">
            <h2 className="mb-2 text-sm font-semibold text-zinc-600">Resumo</h2>
            <p className="text-sm text-zinc-800 whitespace-pre-wrap">{conversa.resumo}</p>
          </section>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {conversa.pontosPositivos && (
            <section className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h2 className="mb-2 text-sm font-semibold text-green-700">Pontos Positivos</h2>
              <p className="text-sm text-green-800 whitespace-pre-wrap">{conversa.pontosPositivos}</p>
            </section>
          )}

          {conversa.pontosMelhoria && (
            <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h2 className="mb-2 text-sm font-semibold text-amber-700">Pontos de Melhoria</h2>
              <p className="text-sm text-amber-800 whitespace-pre-wrap">{conversa.pontosMelhoria}</p>
            </section>
          )}
        </div>

        {conversa.observacoes && (
          <section className="mb-6">
            <h2 className="mb-2 text-sm font-semibold text-zinc-600">Observações</h2>
            <p className="text-sm text-zinc-800 whitespace-pre-wrap">{conversa.observacoes}</p>
          </section>
        )}

        <div className="mt-8 flex items-center gap-3 border-t border-zinc-200 pt-6">
          <Link
            href="/conversas"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Voltar
          </Link>
          <form action={excluirConversaAction.bind(null, conversa.id)}>
            <button
              type="submit"
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Excluir
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
