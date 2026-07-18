import { buscarPlanoPorSlug } from '@/lib/db'
import { CheckoutForm } from './checkout-form'
import Link from 'next/link'

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const plano = await buscarPlanoPorSlug(slug)

  if (!plano) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Plano não encontrado</p>
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline"
          >
            Voltar para home
          </Link>
        </div>
      </div>
    )
  }

  return <CheckoutForm plano={plano} />
}
