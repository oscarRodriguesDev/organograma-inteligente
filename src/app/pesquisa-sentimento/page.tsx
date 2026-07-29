import Link from 'next/link'
import { listarPesquisasSentimento } from '@/lib/db'
import { listarColaboradores } from '@/lib/db'
import { registrarSentimentoAction } from './actions'
import { FaGrinHearts, FaSmile, FaMeh, FaFrownOpen, FaAngry } from 'react-icons/fa'

const SENTIMENTOS = [
  { value: 'muito_positivo', emoji: <FaGrinHearts className="text-xl" />, label: 'Muito Positivo' },
  { value: 'positivo', emoji: <FaSmile className="text-xl" />, label: 'Positivo' },
  { value: 'neutro', emoji: <FaMeh className="text-xl" />, label: 'Neutro' },
  { value: 'negativo', emoji: <FaFrownOpen className="text-xl" />, label: 'Negativo' },
  { value: 'muito_negativo', emoji: <FaAngry className="text-xl" />, label: 'Muito Negativo' },
]

function badgeSentimento(sentimento: string) {
  const s = SENTIMENTOS.find((s) => s.value === sentimento)
  if (!s) return <span>{sentimento}</span>
  const cor = sentimento === 'muito_positivo' || sentimento === 'positivo' ? 'text-green-600 bg-green-50 border-green-200'
    : sentimento === 'negativo' || sentimento === 'muito_negativo' ? 'text-red-600 bg-red-50 border-red-200'
    : 'text-zinc-600 bg-zinc-50 border-zinc-200'
  return <span className={`rounded-lg border px-2 py-0.5 text-xs font-medium ${cor} flex items-center gap-1`}>{s.emoji} {s.label}</span>
}

export default async function PesquisaSentimento() {
  const [pesquisas, colaboradores] = await Promise.all([
    listarPesquisasSentimento(),
    listarColaboradores(),
  ])

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">← Voltar</Link>
        <h1 className="mt-4 mb-8 text-2xl font-bold">Pesquisa de Sentimento</h1>

        <div className="rounded-lg border border-zinc-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Como você está se sentindo?</h2>
          <form action={registrarSentimentoAction} className="space-y-5">
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
              <label className="mb-2 block text-sm font-medium">Sentimento Geral</label>
              <div className="flex gap-2">
                {SENTIMENTOS.map((s) => (
                  <label key={s.value}
                    className="flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-lg border border-zinc-200 p-3 text-xs has-[:checked]:border-black has-[:checked]:bg-zinc-50">
                    <input type="radio" name="sentimento" value={s.value} required className="sr-only" />
                    <span className="text-xl flex items-center">{s.emoji}</span>
                    <span className="text-zinc-600">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="nota" className="mb-1 block text-sm font-medium">Nota Geral (1-5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <label key={n} className="flex flex-1 cursor-pointer flex-col items-center rounded-lg border border-zinc-200 p-2 text-xs has-[:checked]:border-black has-[:checked]:bg-zinc-50">
                    <input type="radio" name="nota" value={n} defaultChecked={n === 3} className="sr-only" />
                    <span className="text-sm font-semibold">{n}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {['engajamento', 'motivacao', 'pertencimento'].map((campo) => (
                <div key={campo}>
                  <label htmlFor={campo} className="mb-1 block text-xs font-medium capitalize">{campo} (1-5)</label>
                  <select id={campo} name={campo}
                    className="w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm focus:border-zinc-500 focus:outline-none">
                    <option value="">—</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div>
              <label htmlFor="comentario" className="mb-1 block text-sm font-medium">Comentário (opcional)</label>
              <textarea id="comentario" name="comentario" rows={3}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
                placeholder="Compartilhe como você tem enxergado a empresa..." />
            </div>

            <button type="submit"
              className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
              Registrar
            </button>
          </form>
        </div>

        <h2 className="text-lg font-semibold mb-4">Histórico</h2>
        {pesquisas.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhuma pesquisa registrada.</p>
        ) : (
          <div className="space-y-3">
            {pesquisas.map((p) => (
              <div key={p.id} className="rounded-lg border border-zinc-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{p.colaboradorNome}</span>
                  {badgeSentimento(p.sentimento)}
                </div>
                <div className="flex gap-4 text-xs text-zinc-500 mb-2">
                  <span>Nota: {p.nota}/5</span>
                  {p.engajamento && <span>Engajamento: {p.engajamento}/5</span>}
                  {p.motivacao && <span>Motivação: {p.motivacao}/5</span>}
                  {p.pertencimento && <span>Pertencimento: {p.pertencimento}/5</span>}
                </div>
                {p.comentario && <p className="text-sm text-zinc-600 italic">"{p.comentario}"</p>}
                <p className="text-xs text-zinc-400 mt-2">
                  {new Date(p.respondidoEm).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
