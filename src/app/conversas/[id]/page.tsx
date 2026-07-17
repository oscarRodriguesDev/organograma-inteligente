import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buscarConversa } from '@/lib/db'

const TIPO_CORES: Record<string, string> = {
  '1:1': 'bg-blue-100 text-blue-700 border-blue-200',
  feedback: 'bg-green-100 text-green-700 border-green-200',
  avaliacao: 'bg-purple-100 text-purple-700 border-purple-200',
  alinhamento: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  desligamento: 'bg-red-100 text-red-700 border-red-200',
  outro: 'bg-zinc-100 text-zinc-700 border-zinc-200',
}

export default async function DetalhesConversa(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const conversa = await buscarConversa(id)

  if (!conversa) notFound()

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/conversas" className="text-sm text-zinc-500 hover:text-zinc-800">← Todas as Conversas</Link>

        <div className="mt-4 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className={`rounded-lg border px-2 py-0.5 text-xs font-medium ${TIPO_CORES[conversa.tipo] || TIPO_CORES.outro}`}>
              {conversa.tipo}
            </span>
            <h1 className="text-2xl font-bold">{conversa.titulo}</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span>Com <strong>{conversa.colaboradorNome}</strong></span>
            <span>{new Date(conversa.realizadaEm).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        <div className="space-y-6">
          {conversa.assunto && (
            <section>
              <h2 className="text-sm font-semibold text-zinc-700 mb-2">Assunto</h2>
              <p className="text-sm text-zinc-600 whitespace-pre-wrap">{conversa.assunto}</p>
            </section>
          )}

          {conversa.resumo && (
            <section>
              <h2 className="text-sm font-semibold text-zinc-700 mb-2">Resumo</h2>
              <p className="text-sm text-zinc-600 whitespace-pre-wrap">{conversa.resumo}</p>
            </section>
          )}

          <div className="grid grid-cols-2 gap-4">
            {conversa.pontosPositivos && (
              <section className="rounded-lg border border-green-200 bg-green-50 p-4">
                <h2 className="text-sm font-semibold text-green-700 mb-2">👍 Pontos Positivos</h2>
                <p className="text-sm text-green-800 whitespace-pre-wrap">{conversa.pontosPositivos}</p>
              </section>
            )}

            {conversa.pontosMelhoria && (
              <section className="rounded-lg border border-red-200 bg-red-50 p-4">
                <h2 className="text-sm font-semibold text-red-700 mb-2">🔧 Pontos de Melhoria</h2>
                <p className="text-sm text-red-800 whitespace-pre-wrap">{conversa.pontosMelhoria}</p>
              </section>
            )}
          </div>

          {conversa.observacoes && (
            <section>
              <h2 className="text-sm font-semibold text-zinc-700 mb-2">Observações</h2>
              <p className="text-sm text-zinc-600 whitespace-pre-wrap">{conversa.observacoes}</p>
            </section>
          )}

          <p className="text-xs text-zinc-400 mt-4">
            Registrada em {new Date(conversa.registradaEm).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  )
}
