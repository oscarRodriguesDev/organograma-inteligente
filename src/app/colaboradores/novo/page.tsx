import Link from 'next/link'
import { cadastrarColaborador, listarPossiveisLideres } from '@/lib/actions'

export default async function NovoColaborador() {
  const possiveisLideres = await listarPossiveisLideres()

  return (
    <div className="flex-1 p-8">
      <div className="max-w-lg mx-auto">
        <Link
          href="/colaboradores"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Voltar
        </Link>

        <h1 className="mt-4 mb-8 text-2xl font-bold">Novo Colaborador</h1>

        <form action={cadastrarColaborador} className="space-y-5">
          <div>
            <label htmlFor="nome" className="mb-1 block text-sm font-medium">
              Nome
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Nome completo"
            />
          </div>

          <div>
            <label htmlFor="funcao" className="mb-1 block text-sm font-medium">
              Função
            </label>
            <input
              id="funcao"
              name="funcao"
              type="text"
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Ex: Analista de TI"
            />
          </div>

          <div>
            <label htmlFor="liderImediatoId" className="mb-1 block text-sm font-medium">
              Líder Imediato
            </label>
            <select
              id="liderImediatoId"
              name="liderImediatoId"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            >
              <option value="">Nenhum (é líder máximo)</option>
              {possiveisLideres.map((lider) => (
                <option key={lider.id} value={lider.id}>
                  {lider.nome} — {lider.funcao}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  )
}
