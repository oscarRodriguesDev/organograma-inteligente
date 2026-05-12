import Link from 'next/link'
import { cadastrarIniciativa } from '@/lib/actions'
import { listarColaboradores } from '@/lib/db'

export default function NovaIniciativa() {
  const colaboradores = listarColaboradores()

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
            <label htmlFor="resultado" className="mb-1 block text-sm font-medium">
              Resultado Obtido
            </label>
            <textarea
              id="resultado"
              name="resultado"
              rows={3}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Qual foi o impacto? Economia de tempo, redução de custos, melhoria de processo..."
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
