'use client'

import { useState } from 'react'
import { FaRobot } from 'react-icons/fa'

interface Props {
  /** ID do select de colaborador */
  colaboradorSelectId?: string
}

/**
 * Botão "Sugerir com IA" para o formulário de iniciativa.
 * Lê o colaborador e o esboço da descrição, chama a API e preenche os campos.
 */
export default function SugerirIniciativaButton({
  colaboradorSelectId = 'colaboradorId',
}: Props) {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleSugerir() {
    setLoading(true)
    setErro(null)

    try {
      // Lê colaborador do select
      const selectEl = document.getElementById(colaboradorSelectId) as HTMLSelectElement
      const colaboradorId = selectEl?.value

      if (!colaboradorId) {
        setErro('Selecione um colaborador primeiro.')
        setLoading(false)
        return
      }

      // Lê o esboço da descrição
      const descricaoEl = document.getElementById('descricao') as HTMLTextAreaElement
      const esboco = descricaoEl?.value || ''

      if (!esboco.trim()) {
        setErro('Escreva um esboço na descrição primeiro.')
        setLoading(false)
        return
      }

      const res = await fetch('/api/ai/iniciativa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colaboradorId, esboco }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.erro || 'Erro ao sugerir iniciativa')
      }

      const data = await res.json()
      const s = data.sugestao

      // Preenche os campos
      const tituloEl = document.getElementById('titulo') as HTMLInputElement
      const resultadoEl = document.getElementById('resultado') as HTMLTextAreaElement
      const unidadeEl = document.getElementById('unidadeMedida') as HTMLSelectElement

      if (tituloEl && s.titulo) {
        tituloEl.value = s.titulo
        tituloEl.dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (descricaoEl && s.descricao) {
        descricaoEl.value = s.descricao
        descricaoEl.dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (resultadoEl && s.resultado) {
        resultadoEl.value = s.resultado
        resultadoEl.dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (unidadeEl && s.unidadeMedidaSugerida) {
        for (let i = 0; i < unidadeEl.options.length; i++) {
          if (unidadeEl.options[i].value === s.unidadeMedidaSugerida) {
            unidadeEl.selectedIndex = i
            unidadeEl.dispatchEvent(new Event('change', { bubbles: true }))
            break
          }
        }
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
        onClick={handleSugerir}
        disabled={loading}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
      >
        {loading ? 'Sugerindo...' : <><FaRobot className="inline-block mb-0.5" /> Sugerir com IA</>}
      </button>
      {erro && <span className="text-xs text-red-500">{erro}</span>}
    </div>
  )
}
