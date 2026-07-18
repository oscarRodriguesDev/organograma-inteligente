import { getSession } from '@/lib/auth'
import { Papel } from '@/lib/types'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logoutAction } from '@/lib/auth-actions'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/empresas', label: 'Empresas', icon: '🏢' },
  { href: '/admin/gastos', label: 'Gastos', icon: '💰' },
  { href: '/admin/financeiro', label: 'Financeiro', icon: '📈' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session || session.papel !== Papel.ADMIN_PLATAFORMA) {
    redirect('/login')
  }

  return (
    <div className="flex-1 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col shrink-0">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/admin" className="text-lg font-bold text-foreground">
            Painel Admin
          </Link>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Administração da Plataforma</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center">
              <span className="text-xs font-bold text-white dark:text-black">
                {session.nome.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{session.nome}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{session.email}</p>
            </div>
          </div>
          <form action={logoutAction} className="mt-3">
            <button
              type="submit"
              className="w-full text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors text-center py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-900">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
