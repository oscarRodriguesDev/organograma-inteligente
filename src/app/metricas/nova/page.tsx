import Link from 'next/link'
import { cadastrarMetrica } from '@/lib/actions'
import { listarColaboradores } from '@/lib/db'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export default function NovaMetrica() {
  const colaboradores = listarColaboradores()
  const agora = new Date()
  const mesAtual = agora.getMonth() + 1
  const anoAtual = agora.getFullYear()

  return (
    <div className="flex-1 p-8">
      <div className="max-w-lg mx-auto">
        <Link
          href="/metricas"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Voltar
        </Link>

        <h1 className="mt-4 mb-8 text-2xl font-bold">Nova Métrica Mensal</h1>

        <form action={cadastrarMetrica} className="space-y-5">
          <div>
            <label htmlFor="colaboradorId" className="mb-1 block text-sm font-medium">
              Colaborador
            </label>
            <select
              id="colaboradorId"
              name="colaboradorId"
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            >
              <option value="">Selecione o colaborador</option>
              {colaboradores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} — {c.funcao}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="mes" className="mb-1 block text-sm font-medium">
                Mês
              </label>
              <select
                id="mes"
                name="mes"
                required
                defaultValue={mesAtual}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              >
                {MESES.map((nome, i) => (
                  <option key={i + 1} value={i + 1}>
                    {nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-28">
              <label htmlFor="ano" className="mb-1 block text-sm font-medium">
                Ano
              </label>
              <input
                id="ano"
                name="ano"
                type="number"
                required
                defaultValue={anoAtual}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="diasTrabalhados" className="mb-1 block text-sm font-medium">
                Dias Trab.
              </label>
              <input
                id="diasTrabalhados"
                name="diasTrabalhados"
                type="number"
                min="0"
                defaultValue={22}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="faltasInjustificadas" className="mb-1 block text-sm font-medium">
                Faltas
              </label>
              <input
                id="faltasInjustificadas"
                name="faltasInjustificadas"
                type="number"
                min="0"
                step="1"
                defaultValue={0}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="horasAtraso" className="mb-1 block text-sm font-medium">
                Atrasos (h)
              </label>
              <input
                id="horasAtraso"
                name="horasAtraso"
                type="number"
                min="0"
                step="0.5"
                defaultValue={0}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="observacao" className="mb-1 block text-sm font-medium">
              Observação
            </label>
            <input
              id="observacao"
              name="observacao"
              type="text"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Opcional"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Registrar Métrica
          </button>
        </form>
      </div>
    </div>
  )
}
