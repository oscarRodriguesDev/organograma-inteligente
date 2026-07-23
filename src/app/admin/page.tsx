import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Papel } from '@/lib/types'
import { obterDadosDashboard, listarEmpresas } from '@/lib/admin-actions'

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function AdminDashboard() {
  const session = await getSession()
  // ADMIN_SUPORTE e ADMIN_PSICH não tem dashboard financeiro, redireciona
  if (session?.papel === Papel.ADMIN_SUPORTE) {
    redirect('/admin/empresas')
  }
  if (session?.papel === Papel.ADMIN_PSICH) {
    redirect('/admin/testes-psicologicos')
  }

  const [dados, empresas] = await Promise.all([
    obterDadosDashboard().catch(() => null),
    listarEmpresas().catch(() => []),
  ])

  const cards = [
    {
      titulo: 'Empresas Ativas',
      valor: dados?.totalEmpresasAtivas ?? 0,
      icone: '🏢',
      cor: 'text-blue-600 dark:text-blue-400',
      fundo: 'bg-blue-50 dark:bg-blue-950/30',
      link: '/admin/empresas',
    },
    {
      titulo: 'Receita do Mês',
      valor: formatarMoeda(dados?.receitaMes ?? 0),
      icone: '💵',
      cor: 'text-emerald-600 dark:text-emerald-400',
      fundo: 'bg-emerald-50 dark:bg-emerald-950/30',
      link: '/admin/financeiro',
    },
    {
      titulo: 'Investimento Total',
      valor: formatarMoeda(dados?.totalInvestimentos ?? 0),
      icone: '📈',
      cor: 'text-sky-600 dark:text-sky-400',
      fundo: 'bg-sky-50 dark:bg-sky-950/30',
      link: '/admin/investimentos',
    },
    {
      titulo: 'Total Colaboradores',
      valor: dados?.totalColaboradores ?? 0,
      icone: '👥',
      cor: 'text-violet-600 dark:text-violet-400',
      fundo: 'bg-violet-50 dark:bg-violet-950/30',
      link: '/admin/empresas',
    },
    {
      titulo: 'Gastos do Mês',
      valor: formatarMoeda(dados?.gastosMes ?? 0),
      icone: '💰',
      cor: 'text-rose-600 dark:text-rose-400',
      fundo: 'bg-rose-50 dark:bg-rose-950/30',
      link: '/admin/gastos',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Visão geral da plataforma
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <Link
            key={card.titulo}
            href={card.link}
            className={`${card.fundo} rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{card.icone}</span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">{card.titulo}</p>
            <p className={`text-2xl font-bold ${card.cor}`}>
              {typeof card.valor === 'number' ? card.valor.toLocaleString('pt-BR') : card.valor}
            </p>
          </Link>
        ))}
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h2>
          <div className="space-y-3">
            <Link
              href="/admin/empresas"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-lg">🏢</span>
              <div>
                <p className="text-sm font-medium text-foreground">Gerenciar Empresas</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{empresas.length} empresas cadastradas</p>
              </div>
            </Link>
            <Link
              href="/admin/investimentos"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center text-lg">📈</span>
              <div>
                <p className="text-sm font-medium text-foreground">Registrar Investimentos</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Controle de capital investido</p>
              </div>
            </Link>
            <Link
              href="/admin/gastos"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-lg">💰</span>
              <div>
                <p className="text-sm font-medium text-foreground">Registrar Gastos</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Controle de despesas do sistema</p>
              </div>
            </Link>
            <Link
              href="/admin/financeiro"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-lg">📈</span>
              <div>
                <p className="text-sm font-medium text-foreground">Indicadores Financeiros</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Receita, gastos e lucro</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Últimas Empresas */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Empresas Recentes</h2>
          {empresas.length === 0 ? (
            <p className="text-sm text-zinc-400 dark:text-zinc-500">Nenhuma empresa cadastrada.</p>
          ) : (
            <div className="space-y-2">
              {empresas.slice(0, 5).map((emp) => (
                <Link
                  key={emp.id}
                  href={`/admin/empresas/${emp.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-600 dark:text-zinc-400 shrink-0">
                      {emp.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{emp.nome}</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">{emp.totalColaboradores} colaboradores</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                      emp.ativa
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {emp.ativa ? 'Ativa' : 'Inativa'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
