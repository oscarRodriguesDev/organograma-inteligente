import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { listarPlanos } from '@/lib/db'
import { Papel } from '@/lib/types'

export default async function Home() {
  const session = await getSession()

  // Se logado, redireciona conforme papel
  if (session) {
    if (session.papel === Papel.ADMIN_PLATAFORMA) {
      redirect('/admin')
    }
    redirect('/organograma')
  }

  const planos = await listarPlanos()

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Organograma Inteligente
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mb-8">
          Gerencie a estrutura hierárquica da sua empresa com simplicidade,
          métricas de desempenho, avaliações e muito mais.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={planos.length > 0 ? `/checkout/${planos[0].slug}` : '/login'}
            className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
          >
            Começar Agora
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900 transition-colors"
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* Planos */}
      <section className="px-6 pb-24 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-center mb-10">
          Escolha o plano ideal para sua empresa
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planos.map((plano) => (
            <div
              key={plano.id}
              className={`relative flex flex-col rounded-xl border p-6 ${
                plano.destaque
                  ? 'border-zinc-900 dark:border-zinc-100 shadow-lg ring-1 ring-zinc-900/10 dark:ring-zinc-100/10'
                  : 'border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {plano.destaque && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900 dark:bg-zinc-100 px-3 py-0.5 text-xs font-medium text-white dark:text-black">
                  Mais popular
                </span>
              )}
              <h3 className="text-lg font-semibold mb-1">{plano.nome}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                {plano.descricao}
              </p>
              <div className="mb-4">
                <span className="text-3xl font-bold">
                  R$ {plano.precoMensal.toFixed(2)}
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  /mês
                </span>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                Ou R$ {plano.precoAnual.toFixed(2)}/mês no plano anual
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                {plano.recursos.map((recurso, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-zinc-900 dark:text-zinc-100 mt-0.5">✓</span>
                    {recurso}
                  </li>
                ))}
              </ul>
              <Link
                href={`/checkout/${plano.slug}`}
                className={`block w-full rounded-lg px-4 py-2.5 text-sm font-medium text-center transition-colors ${
                  plano.destaque
                    ? 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
                    : 'border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                Assinar
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 text-center text-sm text-zinc-400">
        <p>© {new Date().getFullYear()} Organograma Inteligente. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
