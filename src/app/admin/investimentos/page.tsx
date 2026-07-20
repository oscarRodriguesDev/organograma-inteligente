import { listarInvestimentosAction } from '@/lib/admin-actions'
import { AdicionarInvestimentoForm } from './adicionar-investimento-form'
import { EditarInvestimentoForm } from './editar-investimento-form'
import { ExcluirInvestimentoButton } from './excluir-investimento-button'

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR')
}

export default async function AdminInvestimentosPage() {
  const investimentos = await listarInvestimentosAction()
  const total = investimentos.reduce((s, i) => s + i.valor, 0)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Investimentos</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Registre e acompanhe o capital investido na plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-1">
          <AdicionarInvestimentoForm />
        </div>

        {/* Lista */}
        <div className="lg:col-span-2">
          {/* Total */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {investimentos.length} registro(s)
            </p>
            <div className="text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Total investido: </span>
              <span className="font-bold text-foreground">{formatarMoeda(total)}</span>
            </div>
          </div>

          {investimentos.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-lg">Nenhum investimento registrado.</p>
              <p className="text-sm mt-1">Use o formulário ao lado para adicionar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {investimentos.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{inv.descricao}</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        {formatarData(inv.data)} • Criado em {formatarData(inv.createdAt)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-sky-600 dark:text-sky-400">
                        {formatarMoeda(inv.valor)}
                      </p>
                      <div className="flex items-center gap-1 mt-2 justify-end">
                        <EditarInvestimentoForm investimento={inv} />
                        <ExcluirInvestimentoButton
                          investimentoId={inv.id}
                          descricao={inv.descricao}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
