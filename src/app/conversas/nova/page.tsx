import Link from 'next/link'
import { listarColaboradores } from '@/lib/db'
import { registrarConversaAction } from '../actions'

export default async function NovaConversa() {
  const colaboradores = await listarColaboradores()

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/conversas" className="text-sm text-zinc-500 hover:text-zinc-800">← Voltar</Link>
        <h1 className="mt-4 mb-8 text-2xl font-bold">Nova Conversa</h1>

        <form action={registrarConversaAction} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="colaboradorId" className="mb-1 block text-sm font-medium">Colaborador</label>
              <select id="colaboradorId" name="colaboradorId" required
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none">
                <option value="">Selecione</option>
                {colaboradores.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome} — {c.funcao}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tipo" className="mb-1 block text-sm font-medium">Tipo</label>
              <select id="tipo" name="tipo" required
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none">
                <option value="">Selecione</option>
                <option value="1:1">1:1</option>
                <option value="feedback">Feedback</option>
                <option value="avaliacao">Avaliação</option>
                <option value="alinhamento">Alinhamento</option>
                <option value="desligamento">Desligamento</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="titulo" className="mb-1 block text-sm font-medium">Título</label>
              <input id="titulo" name="titulo" type="text" required
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
                placeholder="Ex: Feedback mensal" />
            </div>

            <div>
              <label htmlFor="realizadaEm" className="mb-1 block text-sm font-medium">Data da Conversa</label>
              <input id="realizadaEm" name="realizadaEm" type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label htmlFor="assunto" className="mb-1 block text-sm font-medium">Assunto</label>
            <textarea id="assunto" name="assunto" rows={2}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Principais tópicos discutidos..." />
          </div>

          <div>
            <label htmlFor="resumo" className="mb-1 block text-sm font-medium">Resumo</label>
            <textarea id="resumo" name="resumo" rows={3}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Resumo da conversa..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="pontosPositivos" className="mb-1 block text-sm font-medium text-green-700">Pontos Positivos</label>
              <textarea id="pontosPositivos" name="pontosPositivos" rows={3}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
                placeholder="Conquistas, pontos fortes..." />
            </div>
            <div>
              <label htmlFor="pontosMelhoria" className="mb-1 block text-sm font-medium text-red-700">Pontos de Melhoria</label>
              <textarea id="pontosMelhoria" name="pontosMelhoria" rows={3}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
                placeholder="Oportunidades de desenvolvimento..." />
            </div>
          </div>

          <div>
            <label htmlFor="observacoes" className="mb-1 block text-sm font-medium text-zinc-600">Observações Gerais</label>
            <textarea id="observacoes" name="observacoes" rows={3}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Observações adicionais..." />
          </div>

          <button type="submit"
            className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
            Registrar Conversa
          </button>
        </form>
      </div>
    </div>
  )
}
