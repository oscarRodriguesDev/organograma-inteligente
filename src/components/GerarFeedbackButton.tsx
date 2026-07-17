'use client'

import { useState } from 'react'

interface Props {
  /** IDs dos elementos select de avaliador e avaliado */
  avaliadorSelectId?: string
  avaliadoSelectId?: string
  /** Nomes dos campos de radio no formulário: nota_{criterio} */
  criterios: readonly string[]
  /** ID do textarea de comentário */
  textareaId?: string
}

/**
 * Botão "Gerar Feedback com IA" para o formulário de avaliação.
 * Lê os IDs dos selects e as notas, chama a API e preenche o textarea.
 */
export default function GerarFeedbackButton({
  avaliadorSelectId = 'avaliadorId',
  avaliadoSelectId = 'avaliadoId',
  criterios,
  textareaId = 'comentarioGeral',
}: Props) {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleGerar() {
    setLoading(true)
    setErro(null)

    try {
      // Lê IDs dos selects
      const avaliadorSelect = document.getElementById(avaliadorSelectId) as HTMLSelectElement
      const avaliadoSelect = document.getElementById(avaliadoSelectId) as HTMLSelectElement
      const avaliadorId = avaliadorSelect?.value
      const avaliadoId = avaliadoSelect?.value

      if (!avaliadorId || !avaliadoId) {
        setErro('Selecione avaliador e avaliado primeiro.')
        setLoading(false)
        return
      }

      if (avaliadorId === avaliadoId) {
        setErro('Avaliador e avaliado não podem ser a mesma pessoa.')
        setLoading(false)
        return
      }

      // Coleta notas do formulário
      const notas = criterios.map((criterio) => {
        const radios = document.getElementsByName(`nota_${criterio}`) as NodeListOf<HTMLInputElement>
        let nota = 3 // default
        for (const r of radios) {
          if (r.checked) {
            nota = parseInt(r.value, 10)
            break
          }
        }
        return { criterio, nota }
      })

      const res = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avaliadorId, avaliadoId, criterios: notas }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.erro || 'Erro ao gerar feedback')
      }

      const data = await res.json()

      // Preenche o textarea
      const textarea = document.getElementById(textareaId) as HTMLTextAreaElement
      if (textarea) {
        textarea.value = data.feedback
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
      }
    } catch (err: any) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleGerar}
        disabled={loading}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
      >
        {loading ? 'Gerando...' : '🤖 Gerar Feedback com IA'}
      </button>
      {erro && <span className="text-xs text-red-500">{erro}</span>}
    </div>
  )
}
