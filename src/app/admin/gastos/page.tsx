import { listarGastos } from '@/lib/admin-actions'
import { AdicionarGastoForm } from './adicionar-gasto-form'
import { EditarGastoForm } from './editar-gasto-form'
import { ExcluirGastoButton } from './excluir-gasto-button'
import { FiltroGastos } from './filtro-gastos'

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const TIPOS_GASTO = [
  { value: 'dominio', label: 'Domínio' },
  { value: 'hospedagem', label: 'Hospedagem' },
  { value: 'anuncio', label: 'Anúncio' },
  { value: 'salario', label: 'Salário' },
  { value: 'ia', label: 'IA' },
  { value: 'ferramentas', label: 'Ferramentas' },
  { value: 'outros', label: 'Outros' },
]

export default async function AdminGastosPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; ano?: string }>
}) {
  const sp = await searchParams
  const mesFiltro = sp.mes ? parseInt(sp.mes) : undefined
  const anoFiltro = sp.ano ? parseInt(sp.ano) : undefined

  const gastos = await listarGastos(mesFiltro, anoFiltro)

  const total = gastos.reduce((s, g) => s + g.valor, 0)

  // Meses para o filtro
  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ]

  const anos = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Gastos do Sistema</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Registre e gerencie todos os gastos operacionais da plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-1">
          <AdicionarGastoForm tipos={TIPOS_GASTO} meses={meses} anos={anos} />
        </div>

        {/* Lista */}
        <div className="lg:col-span-2">
          {/* Filtro e Total */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <FiltroGastos
              mesAtual={mesFiltro}
              anoAtual={anoFiltro}
              meses={meses}
              anos={anos}
            />
            <div className="text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Total do período: </span>
              <span className="font-bold text-foreground">{formatarMoeda(total)}</span>
            </div>
          </div>

          {gastos.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-lg">Nenhum gasto registrado.</p>
              <p className="text-sm mt-1">Use o formulário ao lado para adicionar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {gastos.map((gasto) => (
                <div
                  key={gasto.id}
                  className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 capitalize">
                          {gasto.tipo}
                        </span>
                        {gasto.recorrente && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                            Recorrente
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground">{gasto.descricao}</p>
                      {gasto.fornecedor && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{gasto.fornecedor}</p>
                      )}
                      {gasto.observacao && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 italic">{gasto.observacao}</p>
                      )}
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        {gasto.mes}/{gasto.ano} • Criado em {new Date(gasto.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-foreground">{formatarMoeda(gasto.valor)}</p>
                      <div className="flex items-center gap-1 mt-2 justify-end">
                        <EditarGastoForm
                          gasto={gasto}
                          tipos={TIPOS_GASTO}
                          meses={meses}
                          anos={anos}
                        />
                        <ExcluirGastoButton gastoId={gasto.id} descricao={gasto.descricao} />
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
