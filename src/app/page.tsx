import Link from 'next/link'
import { listarColaboradores } from '@/lib/db'

export default async function Home() {
  const colaboradores = await listarColaboradores()

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <main className="max-w-lg text-center">
        <h1 className="text-3xl font-bold mb-4">Organograma Inteligente</h1>
        <p className="text-zinc-600 mb-8">
          Gerencie a estrutura hierárquica da sua empresa de forma simples e visual.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row justify-center">
          <Link
            href="/organograma"
            className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Ver Organograma
          </Link>
          <Link
            href="/colaboradores"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium hover:bg-zinc-50"
          >
            Ver Colaboradores
          </Link>
          <Link
            href="/colaboradores/novo"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium hover:bg-zinc-50"
          >
            Cadastrar Colaborador
          </Link>
          <Link
            href="/avaliacoes"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium hover:bg-zinc-50"
          >
            Ver Avaliações
          </Link>
          <Link
            href="/iniciativas"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium hover:bg-zinc-50"
          >
            Ver Iniciativas
          </Link>
          <Link
            href="/metricas"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium hover:bg-zinc-50"
          >
            Ver Métricas
          </Link>
        </div>

        {colaboradores.length > 0 && (
          <p className="mt-8 text-sm text-zinc-500">
            {colaboradores.length} colaborador{colaboradores.length !== 1 ? 'es' : ''} cadastrado{colaboradores.length !== 1 ? 's' : ''}
          </p>
        )}
      </main>
    </div>
  )
}
