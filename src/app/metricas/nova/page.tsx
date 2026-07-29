import Link from 'next/link'
import { listarColaboradores } from '@/lib/db'
import { NovaMetricaForm } from './form'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export default async function NovaMetricaPage() {
  const colaboradores = await listarColaboradores()
  const agora = new Date()
  const mesAtual = agora.getMonth() + 1
  const anoAtual = agora.getFullYear()

  return (
    <div className="flex-1 p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/metricas"
          className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          ← Voltar
        </Link>

        <h1 className="mt-4 mb-8 text-2xl font-bold">Nova Métrica de Desempenho</h1>

        <NovaMetricaForm
          colaboradores={colaboradores}
          meses={MESES}
          mesAtual={mesAtual}
          anoAtual={anoAtual}
        />
      </div>
    </div>
  )
}
