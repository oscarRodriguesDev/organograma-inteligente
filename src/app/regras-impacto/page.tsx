'use client'

import { useEffect, useState } from 'react'
import type { RegraImpacto, TipoImpacto, RegraCondicao } from '@/lib/types'
import { listarRegrasImpactoAction, criarRegraImpactoAction, atualizarRegraImpactoAction, removerRegraImpactoAction } from '@/lib/simulacao-actions'

const CONDICOES_DISPONIVEIS: { valor: RegraCondicao['tipo']; label: string }[] = [
  { valor: 'time_sem_lider', label: 'Time sem líder' },
  { valor: 'promocao_avaliacao_alta', label: 'Promoção de alto desempenho' },
  { valor: 'perda_lider_experiente', label: 'Perda de liderança experiente' },
  { valor: 'promocao_sem_destaque', label: 'Promoção sem destaque' },
  { valor: 'lider_perfil_ruim', label: 'Líder com perfil inadequado' },
  { valor: 'subordinado_realocado', label: 'Subordinado realocado' },
  { valor: 'time_ganha_lider_forte', label: 'Time ganha líder forte' },
]

export default function RegrasImpactoPage() {
  const [regras, setRegras] = useState<RegraImpacto[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState<TipoImpacto>('neutro')
  const [condicao, setCondicao] = useState<RegraCondicao['tipo']>('time_sem_lider')

  useEffect(() => {
    listarRegrasImpactoAction().then(setRegras)
  }, [])

  function abrirNova() {
    setEditandoId(null)
    setNome('')
    setDescricao('')
    setTipo('neutro')
    setCondicao('time_sem_lider')
    setShowModal(true)
  }

  function abrirEdicao(r: RegraImpacto) {
    setEditandoId(r.id)
    setNome(r.nome)
    setDescricao(r.descricao)
    setTipo(r.tipo)
    setCondicao(r.condicao.tipo)
    setShowModal(true)
  }

  async function salvar() {
    if (!nome.trim() || !descricao.trim()) return
    if (editandoId) {
      const updated = await atualizarRegraImpactoAction(editandoId, {
        nome: nome.trim(),
        descricao: descricao.trim(),
        tipo,
        condicao: { tipo: condicao },
      })
      if (updated) {
        setRegras((prev) => prev.map((r) => (r.id === editandoId ? updated : r)))
      }
    } else {
      const criada = await criarRegraImpactoAction(nome.trim(), descricao.trim(), tipo, { tipo: condicao })
      setRegras((prev) => [...prev, criada])
    }
    setShowModal(false)
  }

  async function toggleAtiva(id: string, ativa: boolean) {
    const updated = await atualizarRegraImpactoAction(id, { ativa: !ativa })
    if (updated) {
      setRegras((prev) => prev.map((r) => (r.id === id ? updated : r)))
    }
  }

  async function excluir(id: string) {
    if (!window.confirm('Excluir esta regra de impacto?')) return
    await removerRegraImpactoAction(id)
    setRegras((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Regras de Impacto</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Regras que determinam quais impactos são detectados automaticamente durante a simulação.
          </p>
        </div>
        <button
          onClick={abrirNova}
          className="px-4 py-2 text-sm rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
        >
          + Nova Regra
        </button>
      </div>

      <div className="space-y-2">
        {regras.map((regra) => {
          const condLabel = CONDICOES_DISPONIVEIS.find((c) => c.valor === regra.condicao.tipo)?.label || regra.condicao.tipo
          return (
            <div
              key={regra.id}
              className={`p-4 rounded-lg border transition-colors ${
                !regra.ativa ? 'bg-zinc-50 border-zinc-200 opacity-60' :
                regra.tipo === 'positivo' ? 'bg-emerald-50 border-emerald-200' :
                regra.tipo === 'negativo' ? 'bg-red-50 border-red-200' :
                'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold uppercase px-1.5 py-0.5 rounded-full ${
                      regra.tipo === 'positivo' ? 'bg-emerald-200 text-emerald-800' :
                      regra.tipo === 'negativo' ? 'bg-red-200 text-red-800' :
                      'bg-zinc-200 text-zinc-700'
                    }`}>
                      {regra.tipo}
                    </span>
                    <span className="font-medium text-zinc-800">{regra.nome}</span>
                    <span className="text-xs text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded-full">{condLabel}</span>
                  </div>
                  <p className="text-sm text-zinc-600 mt-1">{regra.descricao}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleAtiva(regra.id, regra.ativa)}
                    className={`px-2 py-1 text-xs rounded-lg border transition-colors ${
                      regra.ativa
                        ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                        : 'bg-zinc-50 border-zinc-300 text-zinc-500 hover:bg-zinc-100'
                    }`}
                  >
                    {regra.ativa ? 'Ativa' : 'Inativa'}
                  </button>
                  <button
                    onClick={() => abrirEdicao(regra)}
                    className="px-2 py-1 text-xs rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-50 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => excluir(regra.id)}
                    className="px-2 py-1 text-xs rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        {regras.length === 0 && (
          <p className="text-center text-zinc-400 py-8">Nenhuma regra de impacto cadastrada.</p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-6 w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">
              {editandoId ? 'Editar Regra' : 'Nova Regra de Impacto'}
            </h3>

            <label className="text-xs text-zinc-500 mb-1 block">Nome</label>
            <input
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 mb-3 text-sm outline-none focus:border-blue-500"
              placeholder="Ex: Promoção de alto desempenho"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <label className="text-xs text-zinc-500 mb-1 block">Descrição</label>
            <textarea
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 mb-3 text-sm outline-none focus:border-blue-500 resize-none"
              placeholder="Descreva quando esse impacto é detectado..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
            />

            <label className="text-xs text-zinc-500 mb-1 block">Tipo de Impacto</label>
            <select
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 mb-3 text-sm outline-none focus:border-blue-500"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoImpacto)}
            >
              <option value="positivo">Positivo</option>
              <option value="negativo">Negativo</option>
              <option value="neutro">Neutro</option>
            </select>

            <label className="text-xs text-zinc-500 mb-1 block">Condição</label>
            <select
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 mb-4 text-sm outline-none focus:border-blue-500"
              value={condicao}
              onChange={(e) => setCondicao(e.target.value as RegraCondicao['tipo'])}
            >
              {CONDICOES_DISPONIVEIS.map((c) => (
                <option key={c.valor} value={c.valor}>{c.label}</option>
              ))}
            </select>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                className="px-4 py-2 text-sm rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
                disabled={!nome.trim() || !descricao.trim()}
              >
                {editandoId ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
