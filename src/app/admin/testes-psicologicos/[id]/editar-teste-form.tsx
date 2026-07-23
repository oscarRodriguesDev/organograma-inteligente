'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { atualizarTesteAction } from '@/lib/admin-psich-actions'
import type { TestePsicologico, TipoPerguntaTeste } from '@/lib/types'

interface Empresa {
  id: string
  nome: string
  slug: string
  ativa?: boolean
}

interface PerguntaForm {
  id: string
  pergunta: string
  tipo: TipoPerguntaTeste
  opcoes: string[]
  peso: number
  ordem: number
  obrigatoria: boolean
}

let perguntaCounter = 0
function novaPerguntaId() {
  perguntaCounter++
  return `p_${perguntaCounter}_${Date.now()}`
}

export function EditarTesteForm({
  teste,
  empresas,
}: {
  teste: TestePsicologico
  empresas: Empresa[]
}) {
  const router = useRouter()
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [salvando, setSalvando] = useState(false)

  const [titulo, setTitulo] = useState(teste.titulo)
  const [descricao, setDescricao] = useState(teste.descricao)
  const [instrucoes, setInstrucoes] = useState(teste.instrucoes)
  const [tipo, setTipo] = useState(teste.tipo)
  const [ativo, setAtivo] = useState(teste.ativo)
  const [empresasSelecionadas, setEmpresasSelecionadas] = useState<string[]>(teste.empresasDisponiveis ?? [])
  const [perguntas, setPerguntas] = useState<PerguntaForm[]>(
    (teste.perguntas ?? []).map(p => ({
      id: novaPerguntaId(),
      pergunta: p.pergunta,
      tipo: p.tipo,
      opcoes: p.opcoes,
      peso: p.peso,
      ordem: p.ordem,
      obrigatoria: p.obrigatoria,
    }))
  )

  function adicionarPergunta() {
    setPerguntas(prev => [
      ...prev,
      { id: novaPerguntaId(), pergunta: '', tipo: 'escala_1_5', opcoes: [], peso: 1, ordem: prev.length, obrigatoria: true },
    ])
  }

  function removerPergunta(id: string) {
    if (perguntas.length <= 1) return
    setPerguntas(prev => prev.filter(p => p.id !== id).map((p, i) => ({ ...p, ordem: i })))
  }

  function atualizarPergunta(id: string, campo: keyof PerguntaForm, valor: any) {
    setPerguntas(prev => prev.map(p => {
      if (p.id !== id) return p
      if (campo === 'tipo' && valor === 'escala_labeled' && p.opcoes.length === 0) {
        return { ...p, [campo]: valor, opcoes: ['Ótimo', 'Bom', 'Regular', 'Ruim'] }
      }
      return { ...p, [campo]: valor }
    }))
  }

  function toggleEmpresa(empresaId: string) {
    setEmpresasSelecionadas(prev =>
      prev.includes(empresaId) ? prev.filter(id => id !== empresaId) : [...prev, empresaId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setSucesso('')
    setSalvando(true)

    try {
      if (!titulo.trim()) {
        setErro('O título é obrigatório')
        setSalvando(false)
        return
      }

      const perguntasValidas = perguntas.filter(p => p.pergunta.trim())
      if (perguntasValidas.length === 0) {
        setErro('Adicione pelo menos uma pergunta')
        setSalvando(false)
        return
      }

      const formData = new FormData()
      formData.set('titulo', titulo.trim())
      formData.set('descricao', descricao.trim())
      formData.set('instrucoes', instrucoes.trim())
      formData.set('tipo', tipo)
      formData.set('ativo', ativo ? 'on' : 'off')
      formData.set('perguntas', JSON.stringify(perguntasValidas.map(p => ({
        pergunta: p.pergunta.trim(),
        tipo: p.tipo,
        opcoes: (p.tipo === 'multipla_escolha' || p.tipo === 'escala_labeled') ? p.opcoes.filter(o => o.trim()) : [],
        peso: p.peso,
        ordem: p.ordem,
        obrigatoria: p.obrigatoria,
      }))))
      formData.set('empresas', JSON.stringify(empresasSelecionadas))

      const res = await atualizarTesteAction(teste.id, formData)
      if (res.ok) {
        setSucesso('Teste atualizado com sucesso!')
        router.refresh()
      } else {
        setErro(res.erro ?? 'Erro ao atualizar teste')
      }
    } catch (e) {
      setErro('Erro ao atualizar teste')
      console.error(e)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {/* Status */}
      <section className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={ativo}
              onChange={e => setAtivo(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-700"
            />
            Teste Ativo
          </label>
          <span className="text-xs text-zinc-400">
            {ativo ? 'Disponível para as empresas' : 'Oculto para as empresas'}
          </span>
        </div>
      </section>

      {/* Dados Básicos */}
      <section className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-foreground">Informações do Teste</h2>

        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Título *
          </label>
          <input
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            maxLength={200}
            required
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Descrição
          </label>
          <textarea
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Instruções para o Colaborador
          </label>
          <textarea
            value={instrucoes}
            onChange={e => setInstrucoes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Tipo de Teste
          </label>
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
          >
            <option value="personalidade">Personalidade</option>
            <option value="comportamental">Comportamental</option>
            <option value="perfil">Perfil Profissional</option>
            <option value="motivacional">Motivacional</option>
            <option value="estresse">Estresse</option>
            <option value="outro">Outro</option>
          </select>
        </div>
      </section>

      {/* Perguntas */}
      <section className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Perguntas</h2>
          <button
            type="button"
            onClick={adicionarPergunta}
            className="px-3 py-1.5 text-xs font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            + Adicionar Pergunta
          </button>
        </div>

        {perguntas.map((pergunta, index) => (
          <div
            key={pergunta.id}
            className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Pergunta {index + 1}</span>
              {perguntas.length > 1 && (
                <button
                  type="button"
                  onClick={() => removerPergunta(pergunta.id)}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  Remover
                </button>
              )}
            </div>

            <input
              type="text"
              value={pergunta.pergunta}
              onChange={e => atualizarPergunta(pergunta.id, 'pergunta', e.target.value)}
              placeholder="Digite a pergunta..."
              className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-medium text-zinc-400 mb-1">Tipo de Resposta</label>
                <select
                  value={pergunta.tipo}
                  onChange={e => atualizarPergunta(pergunta.id, 'tipo', e.target.value as TipoPerguntaTeste)}
                  className="w-full px-2 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
                >
              <option value="escala_1_5">Escala 1-5</option>
              <option value="escala_labeled">Escala Personalizada (rótulos)</option>
              <option value="multipla_escolha">Múltipla Escolha</option>
                  <option value="verdadeiro_falso">Verdadeiro / Falso</option>
                  <option value="texto">Texto Livre</option>
                </select>
              </div>

              <div className="w-20">
                <label className="block text-[10px] font-medium text-zinc-400 mb-1">Peso</label>
                <input
                  type="number"
                  value={pergunta.peso}
                  onChange={e => atualizarPergunta(pergunta.id, 'peso', parseInt(e.target.value) || 1)}
                  min={1}
                  max={10}
                  className="w-full px-2 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>

              <label className="flex items-center gap-1.5 text-xs text-zinc-500">
                <input
                  type="checkbox"
                  checked={pergunta.obrigatoria}
                  onChange={e => atualizarPergunta(pergunta.id, 'obrigatoria', e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-700"
                />
                Obrigatória
              </label>
            </div>

            {pergunta.tipo === 'multipla_escolha' && (
              <div>
                <label className="block text-[10px] font-medium text-zinc-400 mb-1">Opções (uma por linha)</label>
                <textarea
                  value={pergunta.opcoes.join('\n')}
                  onChange={e => atualizarPergunta(pergunta.id, 'opcoes', e.target.value.split('\n'))}
                  placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                  rows={3}
                  className="w-full px-2 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none"
                />
              </div>
            )}

            {/* Escala Personalizada com rótulos */}
            {pergunta.tipo === 'escala_labeled' && (
              <div>
                <label className="block text-[10px] font-medium text-zinc-400 mb-1.5">
                  Rótulos da escala (cada linha = um ponto na escala)
                </label>
                <p className="text-[10px] text-zinc-400 mb-2">
                  Ex: 1⭐ Péssimo • 2⭐ Ruim • 3⭐ Regular • 4⭐ Bom • 5⭐ Ótimo
                </p>
                <div className="space-y-1.5">
                  {pergunta.opcoes.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400 w-4 shrink-0">{idx + 1}</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={e => {
                          const novas = [...pergunta.opcoes]
                          novas[idx] = e.target.value
                          atualizarPergunta(pergunta.id, 'opcoes', novas)
                        }}
                        placeholder={`Rótulo ${idx + 1}`}
                        className="flex-1 px-2 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                      />
                      {pergunta.opcoes.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const novas = pergunta.opcoes.filter((_, i) => i !== idx)
                            atualizarPergunta(pergunta.id, 'opcoes', novas)
                          }}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      atualizarPergunta(pergunta.id, 'opcoes', [...pergunta.opcoes, ''])
                    }}
                    className="text-xs text-[#0EA5E9] hover:text-[#0284C7] transition-colors mt-1"
                  >
                    + Adicionar nível
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Disponibilidade para Empresas */}
      <section className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Disponibilidade</h2>
        <p className="text-xs text-zinc-400">
          Selecione para quais empresas este teste estará disponível. Se nenhuma for selecionada, o teste ficará disponível para todas.
        </p>

        {empresas.length === 0 ? (
          <p className="text-sm text-zinc-400">Nenhuma empresa cadastrada.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
            {empresas.filter(e => e.ativa !== false).map(empresa => (
              <label
                key={empresa.id}
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  empresasSelecionadas.includes(empresa.id)
                    ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800'
                    : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={empresasSelecionadas.includes(empresa.id)}
                  onChange={() => toggleEmpresa(empresa.id)}
                  className="rounded border-zinc-300 dark:border-zinc-700"
                />
                <span className="text-sm text-foreground truncate">{empresa.nome}</span>
              </label>
            ))}
          </div>
        )}
      </section>

      {erro && (
        <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-300">
          {erro}
        </div>
      )}

      {sucesso && (
        <div className="px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-sm text-emerald-700 dark:text-emerald-300">
          {sucesso}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={salvando}
          className="px-6 py-2.5 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
        >
          {salvando ? 'Salvando...' : 'Salvar Alterações'}
        </button>
        <Link
          href="/admin/testes-psicologicos"
          className="px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Voltar
        </Link>
      </div>
    </form>
  )
}
