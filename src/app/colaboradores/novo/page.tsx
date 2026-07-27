import Link from 'next/link'
import { cadastrarColaborador, listarPossiveisLideres } from '@/lib/actions'
import SelectCargo from '@/components/SelectCargo'
import PapelSelect from '@/components/PapelSelect'

export default async function NovoColaborador() {
  const possiveisLideres = await listarPossiveisLideres()

  return (
    <div className="flex-1 p-8">
      <div className="max-w-lg mx-auto">
        <Link
          href="/colaboradores"
          className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          ← Voltar
        </Link>

        <h1 className="mt-4 mb-8 text-2xl font-bold text-foreground">Novo Colaborador</h1>

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
              maxLength={120}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              placeholder="Nome completo (máx. 120 caracteres)"
            />
          </div>

          <div>
            <label htmlFor="cpf" className="mb-1 block text-sm font-medium">
              CPF (opcional)
            </label>
            <input
              id="cpf"
              name="cpf"
              type="text"
              inputMode="numeric"
              maxLength={11}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              placeholder="Apenas números — gera login automático"
            />
            <p className="mt-1 text-xs text-zinc-400">
              Se informado, o email será gerado como cpf@empresa.com e a senha padrão serão os 6 primeiros dígitos
            </p>
          </div>

          <div>
            <label htmlFor="funcao" className="mb-1 block text-sm font-medium">
              Função (Cargo)
            </label>
            <SelectCargo
              name="funcao"
              required
              placeholder="Selecione o cargo"
            />
          </div>

          <div>
            <label htmlFor="papel" className="mb-1 block text-sm font-medium">
              Papel / Nível hierárquico
            </label>
            <PapelSelect name="papel" />
            <p className="mt-1 text-xs text-zinc-400">
              Se não selecionar, o sistema calcula automaticamente baseado no líder
            </p>
          </div>

          <div>
            <label htmlFor="liderImediatoId" className="mb-1 block text-sm font-medium">
              Líder Imediato
            </label>
            <select
              id="liderImediatoId"
              name="liderImediatoId"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
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
            className="w-full rounded-lg bg-black dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  )
}
