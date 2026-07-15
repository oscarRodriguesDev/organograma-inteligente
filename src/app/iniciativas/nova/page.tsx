import Link from 'next/link'
import { cadastrarIniciativa } from '@/lib/actions'
import { listarColaboradores } from '@/lib/db'

export default async function NovaIniciativa() {
  const colaboradores = await listarColaboradores()

  return (
    <div className="flex-1 p-8">
      <div className="max-w-lg mx-auto">
        <Link
          href="/iniciativas"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Voltar
        </Link>

        <h1 className="mt-4 mb-8 text-2xl font-bold">Nova Iniciativa</h1>

        <form action={cadastrarIniciativa} className="space-y-5">
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

          <div>
            <label htmlFor="titulo" className="mb-1 block text-sm font-medium">
              Título da Iniciativa
            </label>
            <input
              id="titulo"
              name="titulo"
              type="text"
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Ex: Automatização de relatórios"
            />
          </div>

          <div>
            <label htmlFor="descricao" className="mb-1 block text-sm font-medium">
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              rows={3}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Descreva a ideia ou ação realizada..."
            />
          </div>

          <div>
            <label htmlFor="valorResultado" className="mb-1 block text-sm font-medium">
              Resultado Numérico
            </label>
            <div className="flex gap-3">
              <input
                id="valorResultado"
                name="valorResultado"
                type="number"
                step="0.01"
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
                placeholder="Ex: 5000"
              />
              <select
                id="unidadeMedida"
                name="unidadeMedida"
                className="w-40 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              >
                <option value="">Unidade</option>
                <option value="R$/mês">R$/mês</option>
                <option value="R$ (único)">R$ (único)</option>
                <option value="horas/semana">horas/semana</option>
                <option value="horas/mês">horas/mês</option>
                <option value="%">%</option>
                <option value="unidades/dia">unidades/dia</option>
                <option value="pontos">pontos</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="resultado" className="mb-1 block text-sm font-medium">
              Descrição do Resultado
            </label>
            <textarea
              id="resultado"
              name="resultado"
              rows={3}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Explique qual foi o impacto qualitativo..."
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Registrar Iniciativa
          </button>
        </form>
      </div>
    </div>
  )
}
