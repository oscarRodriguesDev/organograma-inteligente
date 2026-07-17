import Link from 'next/link'
import { listarColaboradores } from '@/lib/db'
import { registrarConversaAction } from '../actions'

const TIPOS = [
  { valor: '1:1', rotulo: '1:1' },
  { valor: 'feedback', rotulo: 'Feedback' },
  { valor: 'avaliacao', rotulo: 'Avaliação' },
  { valor: 'alinhamento', rotulo: 'Alinhamento' },
  { valor: 'desligamento', rotulo: 'Desligamento' },
  { valor: 'outro', rotulo: 'Outro' },
] as const

export default async function NovaConversa() {
  const colaboradores = await listarColaboradores()

  const hoje = new Date().toISOString().split('T')[0]

  return (
    <div className="flex-1 p-8">
      <div className="mx-auto max-w-xl">
        <Link
          href="/conversas"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Voltar
        </Link>

        <h1 className="mt-4 mb-8 text-2xl font-bold">Nova Conversa</h1>

        <form action={registrarConversaAction} className="space-y-5">
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
            <label htmlFor="tipo" className="mb-1 block text-sm font-medium">
              Tipo
            </label>
            <select
              id="tipo"
              name="tipo"
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            >
              <option value="">Selecione o tipo</option>
              {TIPOS.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.rotulo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="titulo" className="mb-1 block text-sm font-medium">
              Título
            </label>
            <input
              id="titulo"
              name="titulo"
              type="text"
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Ex: Feedback mensal"
            />
          </div>

          <div>
            <label htmlFor="assunto" className="mb-1 block text-sm font-medium">
              Assunto
            </label>
            <textarea
              id="assunto"
              name="assunto"
              rows={3}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Do que se trata a conversa?"
            />
          </div>

          <div>
            <label htmlFor="resumo" className="mb-1 block text-sm font-medium">
              Resumo
            </label>
            <textarea
              id="resumo"
              name="resumo"
              rows={3}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Resumo da conversa..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pontosPositivos" className="mb-1 block text-sm font-medium">
                Pontos Positivos
              </label>
              <textarea
                id="pontosPositivos"
                name="pontosPositivos"
                rows={3}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
                placeholder="O que foi positivo..."
              />
            </div>

            <div>
              <label htmlFor="pontosMelhoria" className="mb-1 block text-sm font-medium">
                Pontos de Melhoria
              </label>
              <textarea
                id="pontosMelhoria"
                name="pontosMelhoria"
                rows={3}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
                placeholder="O que pode melhorar..."
              />
            </div>
          </div>

          <div>
            <label htmlFor="observacoes" className="mb-1 block text-sm font-medium">
              Observações
            </label>
            <textarea
              id="observacoes"
              name="observacoes"
              rows={3}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Observações adicionais..."
            />
          </div>

          <div>
            <label htmlFor="realizadaEm" className="mb-1 block text-sm font-medium">
              Data da Conversa
            </label>
            <input
              id="realizadaEm"
              name="realizadaEm"
              type="date"
              required
              defaultValue={hoje}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Registrar Conversa
          </button>
        </form>
      </div>
    </div>
  )
}
