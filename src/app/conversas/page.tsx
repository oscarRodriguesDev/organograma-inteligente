import Link from 'next/link'
import { listarConversas } from '@/lib/db'
import { excluirConversaAction } from './actions'

const TIPO_CORES: Record<string, string> = {
  '1:1': 'bg-blue-100 text-blue-700 border-blue-200',
  feedback: 'bg-green-100 text-green-700 border-green-200',
  avaliacao: 'bg-purple-100 text-purple-700 border-purple-200',
  alinhamento: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  desligamento: 'bg-red-100 text-red-700 border-red-200',
  outro: 'bg-zinc-100 text-zinc-700 border-zinc-200',
}

export default async function ListaConversas() {
  const conversas = await listarConversas()

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">← Voltar</Link>
            <h1 className="mt-2 text-2xl font-bold">Conversas</h1>
          </div>
          <Link href="/conversas/nova"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
            Nova Conversa
          </Link>
        </div>

        {conversas.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center">
            <p className="text-zinc-500">Nenhuma conversa registrada.</p>
            <Link href="/conversas/nova" className="mt-2 inline-block text-sm font-medium text-black underline">
              Registrar primeira conversa
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {conversas.map((c) => (
              <Link key={c.id} href={`/conversas/${c.id}`}
                className="block rounded-lg border border-zinc-200 p-5 hover:border-zinc-400 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-lg border px-2 py-0.5 text-xs font-medium ${TIPO_CORES[c.tipo] || TIPO_CORES.outro}`}>
                      {c.tipo}
                    </span>
                    <span className="text-sm font-medium text-zinc-800">{c.titulo}</span>
                  </div>
                  <span className="text-xs text-zinc-400">
                    {new Date(c.realizadaEm).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-sm text-zinc-600">
                  <span className="font-medium">{c.colaboradorNome}</span>
                  {c.resumo && <span> — {c.resumo.slice(0, 120)}{c.resumo.length > 120 ? '...' : ''}</span>}
                </p>
                <div className="mt-3 flex gap-3 text-xs text-zinc-400">
                  {c.pontosPositivos && <span>👍 {c.pontosPositivos.slice(0, 60)}</span>}
                  {c.pontosMelhoria && <span>🔧 {c.pontosMelhoria.slice(0, 60)}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
