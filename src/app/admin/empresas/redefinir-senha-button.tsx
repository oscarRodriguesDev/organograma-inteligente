'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { redefinirSenhaColaboradorAction } from '@/lib/admin-actions'

export function RedefinirSenhaButton({
  colaboradorId,
  colaboradorNome,
}: {
  colaboradorId: string
  colaboradorNome: string
}) {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [novaSenha, setNovaSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setSucesso('')

    if (novaSenha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setEnviando(true)
    try {
      const res = await redefinirSenhaColaboradorAction(colaboradorId, novaSenha)
      if (res.ok) {
        setSucesso('Senha redefinida com sucesso!')
        setNovaSenha('')
        setTimeout(() => {
          setAberto(false)
          setSucesso('')
          router.refresh()
        }, 2000)
      } else {
        setErro(res.erro ?? 'Erro ao redefinir senha')
      }
    } catch {
      setErro('Erro de conexão')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="text-xs px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-300 dark:hover:border-amber-800 transition-colors"
        title="Redefinir senha (último recurso)"
      >
        Redefinir Senha
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Redefinir Senha
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Redefinindo senha de <strong className="text-foreground">{colaboradorNome}</strong>
            </p>

            {sucesso ? (
              <div className="px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm">
                {sucesso}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="novaSenha"
                    className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1"
                  >
                    Nova Senha *
                  </label>
                  <input
                    type="password"
                    id="novaSenha"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    autoFocus
                    className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                  />
                </div>

                {erro && (
                  <p className="text-sm text-red-500">{erro}</p>
                )}

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAberto(false)
                      setErro('')
                    }}
                    className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviando}
                    className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
                  >
                    {enviando ? 'Redefinindo...' : 'Redefinir Senha'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
