'use client'

import { useState } from 'react'
import { responderTestePorTokenAction } from '@/lib/gestao-testes-actions'
import type { TipoPerguntaTeste } from '@/lib/types'

interface PerguntaItem {
  id: string
  pergunta: string
  tipo: TipoPerguntaTeste
  opcoes: string[]
  peso: number
  ordem: number
  obrigatoria: boolean
}

interface ResponderTesteTokenFormProps {
  token: string
  perguntas: PerguntaItem[]
}

export function ResponderTesteTokenForm({
  token,
  perguntas,
}: ResponderTesteTokenFormProps) {
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  function setResposta(perguntaId: string, valor: string) {
    setRespostas(prev => ({ ...prev, [perguntaId]: valor }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setSalvando(true)

    try {
      // Valida obrigatórias
      for (const p of perguntas) {
        if (p.obrigatoria && !respostas[p.id]?.trim()) {
          setErro(`A pergunta "${p.pergunta.substring(0, 50)}..." é obrigatória`)
          setSalvando(false)
          return
        }
      }

      const respostasArray = perguntas
        .filter(p => respostas[p.id]?.trim())
        .map(p => ({
          perguntaId: p.id,
          resposta: respostas[p.id].trim(),
        }))

      if (respostasArray.length === 0) {
        setErro('Responda pelo menos uma pergunta')
        setSalvando(false)
        return
      }

      const result = await responderTestePorTokenAction(token, respostasArray)
      if (result.ok) {
        setSucesso(true)
      } else {
        setErro(result.erro || 'Erro ao salvar respostas')
      }
    } catch {
      setErro('Erro ao salvar respostas')
    } finally {
      setSalvando(false)
    }
  }

  if (sucesso) {
    return (
      <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <p className="text-5xl mb-4">✅</p>
        <p className="text-xl font-bold text-foreground mb-2">Teste concluído com sucesso!</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
          Suas respostas foram registradas. Você já pode fechar esta página.
        </p>
        <div className="w-16 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {perguntas
        .sort((a, b) => a.ordem - b.ordem)
        .map((pergunta, index) => (
          <div
            key={pergunta.id}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm"
          >
            <div className="flex items-start gap-2 mb-3">
              <span className="text-sm font-semibold text-foreground shrink-0 mt-0.5">
                {index + 1}.
              </span>
              <p className="text-sm font-medium text-foreground">
                {pergunta.pergunta}
                {pergunta.obrigatoria && (
                  <span className="text-red-400 ml-1">*</span>
                )}
              </p>
            </div>

            {/* Escala 1-5 */}
            {pergunta.tipo === 'escala_1_5' && (
              <div className="flex gap-2 ml-6">
                {[1, 2, 3, 4, 5].map(nota => (
                  <label
                    key={nota}
                    className={`flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-lg border p-3 text-xs transition-colors ${
                      respostas[pergunta.id] === String(nota)
                        ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800'
                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`p_${pergunta.id}`}
                      value={nota}
                      checked={respostas[pergunta.id] === String(nota)}
                      onChange={e => setResposta(pergunta.id, e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-lg font-bold">{nota}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Escala Labeled */}
            {pergunta.tipo === 'escala_labeled' && (
              <div className="flex gap-2 ml-6">
                {pergunta.opcoes.map((opt, idx) => (
                  <label
                    key={idx}
                    className={`flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-lg border p-2 text-xs transition-colors ${
                      respostas[pergunta.id] === String(idx + 1)
                        ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800'
                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`p_${pergunta.id}`}
                      value={String(idx + 1)}
                      checked={respostas[pergunta.id] === String(idx + 1)}
                      onChange={e => setResposta(pergunta.id, e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-sm font-semibold">{idx + 1}</span>
                    {opt && <span className="text-[10px] text-zinc-500 text-center">{opt}</span>}
                  </label>
                ))}
              </div>
            )}

            {/* Múltipla Escolha */}
            {pergunta.tipo === 'multipla_escolha' && (
              <div className="space-y-1.5 ml-6">
                {pergunta.opcoes.map((opt, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-sm transition-colors ${
                      respostas[pergunta.id] === opt
                        ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800'
                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`p_${pergunta.id}`}
                      value={opt}
                      checked={respostas[pergunta.id] === opt}
                      onChange={e => setResposta(pergunta.id, e.target.value)}
                      className="shrink-0"
                    />
                    <span className="text-foreground">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Verdadeiro / Falso */}
            {pergunta.tipo === 'verdadeiro_falso' && (
              <div className="flex gap-2 ml-6">
                {['Verdadeiro', 'Falso'].map(opt => (
                  <label
                    key={opt}
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                      respostas[pergunta.id] === opt
                        ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800'
                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`p_${pergunta.id}`}
                      value={opt}
                      checked={respostas[pergunta.id] === opt}
                      onChange={e => setResposta(pergunta.id, e.target.value)}
                      className="sr-only"
                    />
                    <span className="font-medium text-foreground">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Texto */}
            {pergunta.tipo === 'texto' && (
              <div className="ml-6">
                <textarea
                  value={respostas[pergunta.id] ?? ''}
                  onChange={e => setResposta(pergunta.id, e.target.value)}
                  placeholder="Digite sua resposta..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none"
                />
              </div>
            )}
          </div>
        ))}

      {erro && (
        <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-300">
          {erro}
        </div>
      )}

      <div className="flex items-center justify-center pt-4">
        <button
          type="submit"
          disabled={salvando}
          className="px-8 py-3 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors shadow-sm"
        >
          {salvando ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Enviando...
            </span>
          ) : (
            'Enviar Respostas'
          )}
        </button>
      </div>
    </form>
  )
}
