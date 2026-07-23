import { listarPlanosAdmin } from '@/lib/admin-planos-actions'
import { AdminPlanosClient } from './planos-client'

export default async function AdminPlanosPage() {
  const planos = await listarPlanosAdmin()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Planos de Assinatura</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Gerencie planos, preços, recursos e promoções da plataforma
        </p>
      </div>

      <AdminPlanosClient planos={planos} />
    </div>
  )
}
