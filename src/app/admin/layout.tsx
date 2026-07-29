import { getSession } from '@/lib/auth'
import { Papel } from '@/lib/types'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logoutAction } from '@/lib/auth-actions'
import { MdDashboard, MdBusiness, MdAssignment, MdTrendingUp, MdAttachMoney, MdBarChart, MdLock, MdPerson, MdEdit } from 'react-icons/md'
import { FaUsers } from 'react-icons/fa'

const navItemsSystem: { href: string; label: string; icon: React.ReactNode }[] = [
  { href: '/admin', label: 'Dashboard', icon: <MdDashboard /> },
  { href: '/admin/empresas', label: 'Empresas', icon: <MdBusiness /> },
  { href: '/admin/planos', label: 'Planos', icon: <MdAssignment /> },
  { href: '/admin/investimentos', label: 'Investimentos', icon: <MdTrendingUp /> },
  { href: '/admin/gastos', label: 'Gastos', icon: <MdAttachMoney /> },
  { href: '/admin/financeiro', label: 'Financeiro', icon: <MdBarChart /> },
  { href: '/admin/usuarios', label: 'Admins', icon: <MdLock /> },
  { href: '/admin/perfil', label: 'Perfil', icon: <MdPerson /> },
]

const navItemsSuporte: { href: string; label: string; icon: React.ReactNode }[] = [
  { href: '/admin/empresas', label: 'Empresas', icon: <MdBusiness /> },
  { href: '/admin/perfil', label: 'Perfil', icon: <MdPerson /> },
]

const navItemsPsich: { href: string; label: string; icon: React.ReactNode }[] = [
  { href: '/admin/testes-psicologicos', label: 'Testes', icon: <MdEdit /> },
  { href: '/admin/empresas', label: 'Empresas', icon: <MdBusiness /> },
  { href: '/admin/perfil', label: 'Perfil', icon: <MdPerson /> },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  // Apenas ADMIN_PLATAFORMA, ADMIN_SUPORTE e ADMIN_PSICH podem acessar
  if (!session) {
    redirect('/login')
  }
  if (session.papel !== Papel.ADMIN_PLATAFORMA && session.papel !== Papel.ADMIN_SUPORTE && session.papel !== Papel.ADMIN_PSICH) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-7xl font-bold text-zinc-300 dark:text-zinc-700">403</h1>
          <h2 className="mt-4 text-xl font-semibold text-foreground">Acesso Negado</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Você não tem permissão para acessar esta página.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <a
              href="/"
              className="px-4 py-2 text-sm rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Ir para o início
            </a>
            <a
              href="/organograma"
              className="px-4 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Ver organograma
            </a>
          </div>
        </div>
      </div>
    )
  }

  const isSystem = session.papel === Papel.ADMIN_PLATAFORMA
  const isPsich = session.papel === Papel.ADMIN_PSICH
  const navItems = isSystem ? navItemsSystem : isPsich ? navItemsPsich : navItemsSuporte

  return (
    <div className="flex-1 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col shrink-0">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/admin" className="text-lg font-bold text-foreground">
            Painel Admin
          </Link>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {isSystem ? 'Administração da Plataforma' : isPsich ? 'Testes Psicológicos' : 'Suporte da Plataforma'}
          </p>
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
            <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center overflow-hidden shrink-0">
              {session.fotoUrl ? (
                <img src={session.fotoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-white dark:text-black">
                  {session.nome.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{session.username || session.nome}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{session.email}</p>
              <p className={`text-[10px] mt-0.5 font-medium ${
                isSystem ? 'text-violet-500 dark:text-violet-400' : isPsich ? 'text-cyan-500 dark:text-cyan-400' : 'text-amber-500 dark:text-amber-400'
              }`}>
                {isSystem ? 'Admin Sistema' : isPsich ? 'Admin Psicólogo' : 'Admin Suporte'}
              </p>
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
