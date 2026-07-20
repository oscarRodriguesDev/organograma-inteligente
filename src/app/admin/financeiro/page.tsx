import { obterDadosFinanceiros } from '@/lib/admin-actions'

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarPercentual(valor: number): string {
  return `${valor >= 0 ? '+' : ''}${valor.toFixed(1)}%`
}

function nomeMes(mes: number): string {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return meses[mes - 1] ?? ''
}

export default async function AdminFinanceiroPage() {
  const dados = await obterDadosFinanceiros()

  const indicadores = [
    {
      titulo: 'Receita Total',
      valor: formatarMoeda(dados.receitaTotal),
      icone: '📥',
      cor: 'text-emerald-600 dark:text-emerald-400',
      fundo: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      titulo: 'Gastos Totais',
      valor: formatarMoeda(dados.gastosTotal),
      icone: '📤',
      cor: 'text-rose-600 dark:text-rose-400',
      fundo: 'bg-rose-50 dark:bg-rose-950/30',
    },
    {
      titulo: 'Investimento Total',
      valor: formatarMoeda(dados.totalInvestimentos),
      icone: '💼',
      cor: 'text-sky-600 dark:text-sky-400',
      fundo: 'bg-sky-50 dark:bg-sky-950/30',
    },
    {
      titulo: 'Lucro Líquido',
      valor: formatarMoeda(dados.lucroLiquido),
      icone: '💎',
      cor: dados.lucroLiquido >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400',
      fundo: dados.lucroLiquido >= 0 ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-red-50 dark:bg-red-950/30',
    },
    {
      titulo: 'ROI',
      valor: formatarPercentual(dados.roi),
      icone: '📈',
      cor: dados.roi >= 0 ? 'text-violet-600 dark:text-violet-400' : 'text-red-600 dark:text-red-400',
      fundo: 'bg-violet-50 dark:bg-violet-950/30',
    },
    {
      titulo: 'Payback',
      valor: dados.payback > 0 ? `${dados.payback.toFixed(1)} meses` : '—',
      icone: '⏱',
      cor: 'text-amber-600 dark:text-amber-400',
      fundo: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      titulo: 'Margem Líquida',
      valor: dados.receitaTotal > 0
        ? formatarPercentual((dados.lucroLiquido / dados.receitaTotal) * 100)
        : '—',
      icone: '📊',
      cor: 'text-cyan-600 dark:text-cyan-400',
      fundo: 'bg-cyan-50 dark:bg-cyan-950/30',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Indicadores Financeiros</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Receitas, gastos e métricas de rentabilidade da plataforma
        </p>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {indicadores.map((ind) => (
          <div
            key={ind.titulo}
            className={`${ind.fundo} rounded-xl p-6 border border-zinc-200 dark:border-zinc-800`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{ind.icone}</span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">{ind.titulo}</p>
            <p className={`text-2xl font-bold ${ind.cor}`}>{ind.valor}</p>
          </div>
        ))}
      </div>

      {/* Tabela Receita vs Gasto por Mês */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-foreground">Receita vs Gasto (últimos 12 meses)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <th className="text-left px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Mês</th>
                <th className="text-right px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Receita</th>
                <th className="text-right px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Gasto</th>
                <th className="text-right px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {dados.meses.map((m) => {
                const saldo = m.receita - m.gasto
                return (
                  <tr key={`${m.mes}-${m.ano}`} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-3 font-medium text-foreground">
                      {nomeMes(m.mes)}/{m.ano}
                    </td>
                    <td className="px-6 py-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                      {formatarMoeda(m.receita)}
                    </td>
                    <td className="px-6 py-3 text-right text-rose-600 dark:text-rose-400 font-medium">
                      {formatarMoeda(m.gasto)}
                    </td>
                    <td className={`px-6 py-3 text-right font-medium ${
                      saldo >= 0
                        ? 'text-zinc-900 dark:text-zinc-100'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatarMoeda(saldo)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
