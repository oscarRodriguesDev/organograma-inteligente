'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { atribuirTesteAction } from '@/lib/gestao-testes-actions'

interface ColaboradorItem {
  id: string
  nome: string
  funcao: string
  papel: string
  status: string
}

interface ResultadoAtribuicao {
  colaboradorId: string
  nome: string
  token: string
  link: string
}

interface AtribuirTesteFormProps {
  testeId: string
  testeTitulo: string
  colaboradores: ColaboradorItem[]
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {})
}

export function AtribuirTesteForm({
  testeId,
  testeTitulo,
  colaboradores,
}: AtribuirTesteFormProps) {
  const router = useRouter()
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [busca, setBusca] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [resultados, setResultados] = useState<ResultadoAtribuicao[] | null>(null)
  const [copiado, setCopiado] = useState<string | null>(null)

  const colaboradoresFiltrados = useMemo(() => {
    if (!busca.trim()) return colaboradores
    const termo = busca.toLowerCase().trim()
    return colaboradores.filter(
      (c) =>
        c.nome.toLowerCase().includes(termo) ||
        c.funcao.toLowerCase().includes(termo) ||
        c.papel.toLowerCase().includes(termo)
    )
  }, [busca, colaboradores])

  function toggleColaborador(id: string) {
    setSelecionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selecionarTodos() {
    if (selecionados.size === colaboradoresFiltrados.length) {
      setSelecionados(new Set())
    } else {
      setSelecionados(new Set(colaboradoresFiltrados.map((c) => c.id)))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selecionados.size === 0) {
      setErro('Selecione pelo menos um colaborador')
      return
    }

    setEnviando(true)
    setErro('')

    try {
      const result = await atribuirTesteAction(testeId, Array.from(selecionados))
      if (result.ok && result.resultados) {
        setResultados(result.resultados)
      } else {
        setErro(result.erro || 'Erro ao atribuir teste')
      }
    } catch {
      setErro('Erro ao atribuir teste')
    } finally {
      setEnviando(false)
    }
  }

  function handleCopiarLink(link: string) {
    copyToClipboard(link)
    setCopiado(link)
    setTimeout(() => setCopiado(null), 2000)
  }

  function copiarTodosLinks() {
    if (!resultados) return
    const texto = resultados.map(r => `${r.nome}: ${r.link}`).join('\n')
    copyToClipboard(texto)
    setCopiado('todos')
    setTimeout(() => setCopiado(null), 2000)
  }

  // ─── Tela de Links Gerados ─────────────────────────────
  if (resultados) {
    return (
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-emerald-50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Teste atribuído com sucesso!
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {resultados.length} link(s) gerado(s) para <strong>{testeTitulo}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-3">
          {resultados.map((r) => (
            <div
              key={r.colaboradorId}
              className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{r.nome}</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded truncate max-w-[320px] block">
                    {r.link}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopiarLink(r.link)}
                    className="shrink-0 px-2.5 py-1 text-[11px] font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {copiado === r.link ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={copiarTodosLinks}
            className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-foreground transition-colors underline underline-offset-2"
          >
            {copiado === 'todos' ? '✓ Todos copiados!' : 'Copiar todos os links'}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setResultados(null)
                setSelecionados(new Set())
              }}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Atribuir novamente
            </button>
            <a
              href="/gestao/testes"
              className="px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Voltar
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ─── Tela de Seleção ──────────────────────────────────
  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Selecionar Colaboradores
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {colaboradores.length} colaboradores ativos na empresa
              </p>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
              {selecionados.size} selecionado(s)
            </span>
          </div>
        </div>

        {/* Busca */}
        <div className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nome, função ou cargo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
        </div>

        {/* Select All */}
        <div className="px-5 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={colaboradoresFiltrados.length > 0 && selecionados.size === colaboradoresFiltrados.length}
              onChange={selecionarTodos}
              className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-zinc-400"
            />
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {selecionados.size === colaboradoresFiltrados.length
                ? 'Desmarcar todos'
                : `Selecionar todos (${colaboradoresFiltrados.length})`}
            </span>
          </label>
        </div>

        {/* Lista */}
        <div className="max-h-[400px] overflow-y-auto divide-y divide-zinc-200 dark:divide-zinc-800">
          {colaboradoresFiltrados.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
              {busca ? 'Nenhum colaborador encontrado' : 'Nenhum colaborador disponível'}
            </div>
          ) : (
            colaboradoresFiltrados.map((col) => (
              <label
                key={col.id}
                className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${
                  selecionados.has(col.id) ? 'bg-zinc-50 dark:bg-zinc-900/30' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={selecionados.has(col.id)}
                  onChange={() => toggleColaborador(col.id)}
                  className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-zinc-400 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {col.nome}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {col.funcao} · {col.papel}
                  </p>
                </div>
              </label>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-zinc-200 dark:border-zinc-800">
          {erro && (
            <div className="mb-3 px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-300">
              {erro}
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {selecionados.size} de {colaboradores.length} selecionados
            </p>
            <div className="flex items-center gap-2">
              <a
                href="/gestao/testes"
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </a>
              <button
                type="submit"
                disabled={enviando || selecionados.size === 0}
                className="px-5 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
              >
                {enviando ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Gerando links...
                  </span>
                ) : (
                  `Gerar Links${selecionados.size > 0 ? ` (${selecionados.size})` : ''}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
