import { CriarEmpresaAdminForm } from './criar-empresa-form'

export default function AdminNovaEmpresaPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Nova Empresa</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Crie uma empresa diretamente, sem passar pelo checkout. Defina o CEO que irá gerenciá-la.
        </p>
      </div>

      <CriarEmpresaAdminForm />

      <div className="mt-6 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-sm">
        <strong>⚠️ Importante:</strong> O CEO será o administrador da empresa e terá acesso total
        às funcionalidades. Você, como admin da plataforma, não terá acesso aos dados internos
        da empresa (colaboradores, avaliações, métricas, etc).
      </div>
    </div>
  )
}
