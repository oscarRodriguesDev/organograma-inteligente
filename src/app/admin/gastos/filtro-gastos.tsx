'use client'

import { useRouter } from 'next/navigation'

export function FiltroGastos({
  mesAtual,
  anoAtual,
  meses,
  anos,
}: {
  mesAtual?: number
  anoAtual?: number
  meses: { value: number; label: string }[]
  anos: number[]
}) {
  const router = useRouter()

  function handleChange() {
    const mes = (document.getElementById('filtro-mes') as HTMLSelectElement)?.value
    const ano = (document.getElementById('filtro-ano') as HTMLSelectElement)?.value
    const params = new URLSearchParams()
    if (mes) params.set('mes', mes)
    if (ano) params.set('ano', ano)
    const qs = params.toString()
    router.push(qs ? `/admin/gastos?${qs}` : '/admin/gastos')
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-500 dark:text-zinc-400">Filtrar:</span>
      <select
        id="filtro-mes"
        defaultValue={mesAtual ?? ''}
        onChange={handleChange}
        className="px-2.5 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
      >
        <option value="">Todos os meses</option>
        {meses.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      <select
        id="filtro-ano"
        defaultValue={anoAtual ?? ''}
        onChange={handleChange}
        className="px-2.5 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
      >
        <option value="">Todos os anos</option>
        {anos.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
      {(mesAtual || anoAtual) && (
        <button
          onClick={() => router.push('/admin/gastos')}
          className="text-xs px-2.5 py-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          Limpar
        </button>
      )}
    </div>
  )
}
