'use client'

import { useState, useCallback } from 'react'

interface Props {
  colaboradorId: string
  colaboradorNome: string
}

type Analise = {
  sentimento: 'positivo' | 'negativo' | 'neutro'
  score: number
  insights: string[]
}

/**
 * Badge/Botão que analisa o sentimento dos comentários de um colaborador.
 * Pode ser colocado na listagem de colaboradores ou avaliações.
 */
export default function AnaliseSentimentoBadge({ colaboradorId, colaboradorNome }: Props) {
  const [analise, setAnalise] = useState<Analise | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [aberto, setAberto] = useState(false)

  const handleAnalisar = useCallback(async () => {
    if (analise && aberto) {
      setAberto(false)
      return
    }

    if (analise) {
      setAberto(true)
      return
    }

    setLoading(true)
    setErro(null)

    try {
      const res = await fetch('/api/ai/sentimento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colaboradorId }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.erro || 'Erro na análise')
      }

      const data = await res.json()
      setAnalise(data.analise)
      setAberto(true)
    } catch (err: any) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }, [colaboradorId, analise, aberto])

  const corPorSentimento = {
    positivo: 'text-green-600 border-green-200 bg-green-50',
    negativo: 'text-red-600 border-red-200 bg-red-50',
    neutro: 'text-zinc-600 border-zinc-200 bg-zinc-50',
  }

  const iconePorSentimento = {
    positivo: '😊',
    negativo: '😟',
    neutro: '😐',
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleAnalisar}
        disabled={loading}
        className="rounded-lg border px-2 py-0.5 text-xs font-medium hover:opacity-80 disabled:opacity-50
          ${analise ? corPorSentimento[analise.sentimento] : 'border-zinc-300 text-zinc-500'}"
        title="Analisar sentimento dos comentários"
      >
        {loading ? '⏳' : analise ? `${iconePorSentimento[analise.sentimento]} ${Math.round(analise.score * 100)}%` : '🧠 Sentimento'}
      </button>

      {aberto && analise && (
        <div className="absolute right-0 top-6 z-50 w-72 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700">{colaboradorNome}</span>
            <span className={`text-xs font-medium ${
              analise.sentimento === 'positivo' ? 'text-green-600' :
              analise.sentimento === 'negativo' ? 'text-red-600' : 'text-zinc-500'
            }`}>
              {analise.sentimento.toUpperCase()} ({Math.round(analise.score * 100)}%)
            </span>
          </div>
          {analise.insights.length > 0 && (
            <ul className="space-y-1">
              {analise.insights.map((insight, i) => (
                <li key={i} className="text-xs text-zinc-600">• {insight}</li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => setAberto(false)}
            className="mt-2 text-xs text-zinc-400 hover:text-zinc-600"
          >
            Fechar
          </button>
        </div>
      )}

      {erro && (
        <div className="absolute right-0 top-6 z-50 w-64 rounded-lg border border-red-200 bg-red-50 p-2 shadow-lg">
          <span className="text-xs text-red-600">{erro}</span>
        </div>
      )}
    </div>
  )
}
