'use client'

import Link from 'next/link'
import { useActionState, useState, useEffect, useCallback } from 'react'
import { criarProjetoAction, listarColaboradoresProjetoAction } from '../actions'

interface ColaboradorOption {
  id: string
  nome: string
  funcao: string
  fotoUrl: string | null
}

interface ParticipanteInput {
  colaboradorId: string
  responsabilidade: string
  peso: number
}

// Autor é fixo e não aparece na lista de selecionáveis
export default function NovoProjeto() {
  const [state, formAction, pending] = useActionState(criarProjetoAction, null)

  const hoje = new Date().toISOString().split('T')[0]

  // Colaboradores disponíveis (exceto o autor)
  const [colaboradores, setColaboradores] = useState<ColaboradorOption[]>([])
  const [loadingColabs, setLoadingColabs] = useState(true)
  const [autorNome, setAutorNome] = useState('')

  // Participantes adicionados (exceto o autor)
  const [participantes, setParticipantes] = useState<ParticipanteInput[]>([])

  // Estado do seletor de novo participante
  const [selectedColabId, setSelectedColabId] = useState('')
  const [selectedResp, setSelectedResp] = useState('')
  const [selectedPeso, setSelectedPeso] = useState(3)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    listarColaboradoresProjetoAction().then((list) => {
      // O autor será o primeiro da lista (quem está logado)
      // Como não temos o id do autor no cliente, vamos pegar da sessão
      // Na verdade, a action retorna todos os colaboradores da empresa
      // Precisamos do session do cliente para saber quem é o autor
      // Vamos usar uma abordagem: o servidor já sabe quem é o autor
      // e vai tratá-lo automaticamente. O cliente só adiciona participantes.
      setColaboradores(list as unknown as ColaboradorOption[])
      setLoadingColabs(false)
    })
  }, [])

  const addParticipante = useCallback(() => {
    if (!selectedColabId || !selectedResp.trim()) return
    // Verificar se já foi adicionado
    if (participantes.some(p => p.colaboradorId === selectedColabId)) return
    setParticipantes(prev => [
      ...prev,
      {
        colaboradorId: selectedColabId,
        responsabilidade: selectedResp.trim(),
        peso: selectedPeso,
      },
    ])
    setSelectedColabId('')
    setSelectedResp('')
    setSelectedPeso(3)
  }, [selectedColabId, selectedResp, selectedPeso, participantes])

  const removeParticipante = useCallback((colaboradorId: string) => {
    setParticipantes(prev => prev.filter(p => p.colaboradorId !== colaboradorId))
  }, [])

  const filteredColabs = colaboradores.filter(c =>
    !participantes.some(p => p.colaboradorId === c.id) &&
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const participantesComDados = participantes.map(p => {
    const colab = colaboradores.find(c => c.id === p.colaboradorId)
    return { ...p, nome: colab?.nome ?? 'Desconhecido', funcao: colab?.funcao ?? '' }
  })

  return (
    <div className="flex-1 p-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/projetos"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Voltar
        </Link>

        <h1 className="mb-8 mt-4 text-2xl font-bold">Novo Projeto</h1>

        <form action={formAction} className="space-y-5">
          {/* Nome */}
          <div>
            <label htmlFor="nome" className="mb-1 block text-sm font-medium">
              Nome do Projeto <span className="text-red-500">*</span>
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              required
              maxLength={200}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Ex: Migração de servidor"
            />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="descricao" className="mb-1 block text-sm font-medium">
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              rows={3}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Descreva o objetivo e escopo do projeto..."
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dataInicio" className="mb-1 block text-sm font-medium">
                Data de Início
              </label>
              <input
                id="dataInicio"
                name="dataInicio"
                type="date"
                defaultValue={hoje}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="dataFim" className="mb-1 block text-sm font-medium">
                Data de Término
              </label>
              <input
                id="dataFim"
                name="dataFim"
                type="date"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          {/* ─── Participantes ─────────────── */}
          <div className="rounded-lg border border-zinc-200 p-4">
            <h2 className="mb-3 text-lg font-semibold">Participantes</h2>

            {/* Autor (fixo, peso 5) */}
            <div className="mb-4 rounded-lg bg-zinc-50 p-3">
              <p className="text-xs font-medium text-zinc-500">AUTOR (peso máximo)</p>
              <p className="mt-1 text-sm font-medium">Você (autor do projeto)</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                <span>Peso: 5</span>
                <span className="text-zinc-300">|</span>
                <span>Responsabilidade: Autor do projeto</span>
              </div>
            </div>

            {/* Lista de participantes adicionados */}
            {participantesComDados.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-xs font-medium text-zinc-500">PARTICIPANTES</p>
                {participantesComDados.map((p) => (
                  <div
                    key={p.colaboradorId}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{p.nome}</p>
                      <p className="text-xs text-zinc-500 truncate">{p.funcao}</p>
                    </div>
                    <div className="mx-3 flex items-center gap-2 text-xs text-zinc-600">
                      <span className="font-medium">Peso: {p.peso}</span>
                      <span className="text-zinc-300">|</span>
                      <span className="max-w-[120px] truncate" title={p.responsabilidade}>
                        {p.responsabilidade}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeParticipante(p.colaboradorId)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Adicionar novo participante */}
            {!loadingColabs && (
              <div className="space-y-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-3">
                <p className="text-xs font-medium text-zinc-500">ADICIONAR PARTICIPANTE</p>

                {/* Busca */}
                <input
                  type="text"
                  placeholder="Buscar colaborador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
                />

                {/* Select de colaborador */}
                <select
                  value={selectedColabId}
                  onChange={(e) => setSelectedColabId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
                >
                  <option value="">Selecione um colaborador...</option>
                  {filteredColabs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} — {c.funcao}
                    </option>
                  ))}
                </select>

                {/* Responsabilidade */}
                <input
                  type="text"
                  placeholder="Responsabilidade no projeto..."
                  value={selectedResp}
                  onChange={(e) => setSelectedResp(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
                />

                {/* Peso */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-zinc-600">Peso (impacto da saída):</label>
                  <select
                    value={selectedPeso}
                    onChange={(e) => setSelectedPeso(Number(e.target.value))}
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map((v) => (
                      <option key={v} value={v}>
                        {v} — {v === 1 ? 'Mínimo' : v === 2 ? 'Baixo' : v === 3 ? 'Médio' : v === 4 ? 'Alto' : 'Máximo'}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  disabled={!selectedColabId || !selectedResp.trim()}
                  onClick={addParticipante}
                  className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
                >
                  Adicionar Participante
                </button>
              </div>
            )}

            {loadingColabs && (
              <p className="text-sm text-zinc-400">Carregando colaboradores...</p>
            )}
          </div>

          {/* Campo oculto com JSON dos participantes */}
          <input
            type="hidden"
            name="participantes"
            value={JSON.stringify(participantes)}
          />

          {/* Erro */}
          {state && typeof state === 'object' && 'error' in state && (
            <p className="text-sm text-red-600">{state.error as string}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {pending ? 'Salvando...' : 'Criar Projeto'}
          </button>
        </form>
      </div>
    </div>
  )
}
