'use client'

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type Edge,
  Handle,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { Colaborador } from '@/lib/types'
import {
  atualizarColaboradorAction,
  excluirColaboradorComSubordinados,
  adicionarColaboradorRapido,
} from '@/lib/actions'

interface NodeData {
  colaborador: Colaborador
  onToggle: (id: string) => void
  onEditar: (id: string, nome: string, funcao: string) => void
  onExcluir: (id: string) => void
  onAdicionar: (id: string) => void
  expandido: boolean
  temFilhos: boolean
}

function obterSubordinados(col: Colaborador[], id: string): Colaborador[] {
  return col.filter((c) => c.liderImediatoId === id)
}

function getVisible(
  colaboradores: Colaborador[],
  expandidos: Set<string>
): Colaborador[] {
  const result: Colaborador[] = []
  const roots = colaboradores.filter((c) => !c.liderImediatoId)

  function add(node: Colaborador) {
    if (result.some((r) => r.id === node.id)) return
    result.push(node)
    if (expandidos.has(node.id)) {
      for (const child of obterSubordinados(colaboradores, node.id)) {
        add(child)
      }
    }
  }

  for (const r of roots) add(r)
  return result
}

function toggleExpanded(
  prev: Set<string>,
  id: string,
  colaboradores: Colaborador[]
): Set<string> {
  const next = new Set(prev)
  if (next.has(id)) {
    next.delete(id)
    function clean(pid: string) {
      for (const c of colaboradores) {
        if (c.liderImediatoId === pid) {
          next.delete(c.id)
          clean(c.id)
        }
      }
    }
    clean(id)
  } else {
    next.add(id)
  }
  return next
}

function layoutArvore(
  colaboradores: Colaborador[]
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  const raizes = colaboradores.filter((c) => !c.liderImediatoId)
  const niveis: Map<number, Colaborador[]> = new Map()
  const visitados = new Set<string>()

  function dfs(col: Colaborador, nivel: number) {
    if (visitados.has(col.id)) return
    visitados.add(col.id)
    if (!niveis.has(nivel)) niveis.set(nivel, [])
    niveis.get(nivel)!.push(col)
    const filhos = colaboradores.filter((c) => c.liderImediatoId === col.id)
    for (const f of filhos) dfs(f, nivel + 1)
  }

  for (const r of raizes) dfs(r, 0)

  const NIVEL_H = 140
  const NODE_W = 180
  const LARGURA_POR_NIVEL: number[] = []
  for (const [nivel, cols] of niveis) {
    LARGURA_POR_NIVEL[nivel] =
      (LARGURA_POR_NIVEL[nivel - 1] || 0) + cols.length * (NODE_W + 40)
  }
  const maxLargura = Math.max(...LARGURA_POR_NIVEL.filter(Boolean))

  for (const [nivel, cols] of niveis) {
    const totalWidth = cols.length * (NODE_W + 40) - 40
    const startX = (maxLargura - totalWidth) / 2
    for (let i = 0; i < cols.length; i++) {
      const x = startX + i * (NODE_W + 40) + NODE_W / 2
      const y = nivel * NIVEL_H + 40
      nodes.push({
        id: cols[i].id,
        type: 'colaborador',
        position: { x, y },
        data: { colaborador: cols[i] },
      })
    }
  }

  for (const col of colaboradores) {
    if (col.liderImediatoId) {
      edges.push({
        id: `${col.liderImediatoId}-${col.id}`,
        source: col.liderImediatoId,
        target: col.id,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#d4d4d4', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#d4d4d4' },
      })
    }
  }

  return { nodes, edges }
}

// ---------- Node component ----------

function OrganogramaNode({
  data,
}: {
  data: {
    colaborador: Colaborador
    onToggle: (id: string) => void
    onEditar: (id: string, nome: string, funcao: string) => void
    onExcluir: (id: string) => void
    onAdicionar: (id: string) => void
    expandido: boolean
    temFilhos: boolean
  }
}) {
  const {
    colaborador,
    onToggle,
    onEditar,
    onExcluir,
    onAdicionar,
    expandido,
    temFilhos,
  } = data
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState(colaborador.nome)
  const [funcao, setFuncao] = useState(colaborador.funcao)
  const nomeRef = useRef<HTMLInputElement>(null)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    if (editando && nomeRef.current) nomeRef.current.focus()
  }, [editando])

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setNome(colaborador.nome)
      setFuncao(colaborador.funcao)
      setEditando(true)
    },
    [colaborador.nome, colaborador.funcao]
  )

  const handleSalvar = useCallback(() => {
    if (nome.trim() && funcao.trim()) {
      onEditar(colaborador.id, nome.trim(), funcao.trim())
    }
    setEditando(false)
  }, [nome, funcao, colaborador.id, onEditar])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSalvar()
      if (e.key === 'Escape') setEditando(false)
    },
    [handleSalvar]
  )

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!editando) {
        e.stopPropagation()
        onToggle(colaborador.id)
      }
    },
    [editando, colaborador.id, onToggle]
  )

  if (editando) {
    return (
      <div className="rounded-lg border-2 border-blue-500 bg-blue-50 px-4 py-3 shadow-sm min-w-[200px]">
        <Handle
          type="target"
          position={Position.Top}
          className="!border-zinc-300"
        />
        <input
          ref={nomeRef}
          className="w-full text-sm font-semibold text-zinc-900 bg-white border border-zinc-300 rounded px-1 mb-1 outline-none"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSalvar}
        />
        <input
          className="w-full text-xs text-zinc-500 bg-white border border-zinc-300 rounded px-1 outline-none"
          value={funcao}
          onChange={(e) => setFuncao(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSalvar}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="!border-zinc-300"
        />
      </div>
    )
  }

  return (
    <div
      className="group relative rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-sm min-w-[160px] hover:shadow-md transition-shadow"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!border-zinc-300"
      />

      {/* Expand/collapse area */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {temFilhos && (
          <span
            className={`text-xs text-zinc-400 transition-transform duration-200 shrink-0 ${
              expandido ? 'rotate-90' : ''
            }`}
          >
            ▶
          </span>
        )}
        {!temFilhos && <span className="w-3 shrink-0" />}
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-900 truncate">
            {colaborador.nome}
          </div>
          <div className="text-xs text-zinc-500 truncate">
            {colaborador.funcao}
          </div>
        </div>
      </div>

      {/* Hover actions */}
      {hover && (
        <div className="absolute -top-3 right-2 z-20 flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onAdicionar(colaborador.id) }}
            className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-xs hover:bg-emerald-600 shadow-sm"
            title="Adicionar subordinado"
          >
            +
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onExcluir(colaborador.id) }}
            className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs hover:bg-red-600 shadow-sm"
            title="Excluir"
          >
            ×
          </button>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!border-zinc-300"
      />
    </div>
  )
}

const nodeTypes = { colaborador: OrganogramaNode }

// ---------- Inner canvas ----------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FlowInner(props: any) {
  const { nodes, edges, onNodesChange, onEdgesChange, onNodeClick } = props
  const reactFlow = useReactFlow()

  useEffect(() => {
    requestAnimationFrame(() => {
      reactFlow.fitView({ padding: 0.3, duration: 200 })
    })
  }, [nodes.length, reactFlow])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      attributionPosition="bottom-left"
      minZoom={0.2}
      maxZoom={2.5}
      panOnDrag
      zoomOnScroll
      selectNodesOnDrag={false}
      fitView={false}
    >
      <Background />
      <Controls />
      <MiniMap
        nodeStrokeColor="#71717a"
        nodeColor="#fafafa"
        nodeBorderRadius={4}
        style={{ border: '1px solid #e4e4e7' }}
      />
    </ReactFlow>
  )
}

// ---------- Main component ----------

export default function OrganogramaFlow({
  colaboradores,
}: {
  colaboradores: Colaborador[]
}) {
  const [colaboradoresState, setColaboradoresState] = useState(colaboradores)
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set())
  const [adicionandoEm, setAdicionandoEm] = useState<string | null>(null)
  const [novoNome, setNovoNome] = useState('')
  const [novaFuncao, setNovaFuncao] = useState('')

  // Populate initial expandidos so the CEO root is visible (roots have no parent)
  // When expandidos is empty, only roots are shown. That's correct: only CEO initially.

  const visiveis = useMemo(
    () => getVisible(colaboradoresState, expandidos),
    [colaboradoresState, expandidos]
  )

  const layout = useMemo(() => layoutArvore(visiveis), [visiveis])

  const [nodes, setNodes, onNodesChange] = useNodesState(layout.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layout.edges)

  // Sync layout when expandidos or colaboradoresState changes
  useEffect(() => {
    setNodes(layout.nodes)
    setEdges(layout.edges)
  }, [layout, setNodes, setEdges])

  // ---------- Callbacks ----------

  const handleToggle = useCallback((id: string) => {
    setExpandidos((prev) => toggleExpanded(prev, id, colaboradoresState))
  }, [colaboradoresState])

  const handleEditar = useCallback(
    async (id: string, nome: string, funcao: string) => {
      await atualizarColaboradorAction(id, nome, funcao)
      setColaboradoresState((prev) =>
        prev.map((c) => (c.id === id ? { ...c, nome, funcao } : c))
      )
      setNodes((nds) =>
        nds.map((n) => {
          const d = n.data as unknown as NodeData
          return n.id === id
            ? {
                ...n,
                data: {
                  ...d,
                  colaborador: { ...d.colaborador, nome, funcao },
                },
              }
            : n
        })
      )
    },
    [setNodes]
  )

  const handleExcluir = useCallback(
    async (id: string) => {
      const col = colaboradoresState.find((c) => c.id === id)
      if (!col) return
      const msg = `Excluir "${col.nome}"?\nSubordinados serão transferidos para o líder imediato.`
      if (!window.confirm(msg)) return

      await excluirColaboradorComSubordinados(id)

      setColaboradoresState((prev) => {
        const filtered = prev.filter((c) => c.id !== id)
        return filtered.map((c) =>
          c.liderImediatoId === id
            ? { ...c, liderImediatoId: col.liderImediatoId }
            : c
        )
      })

      setExpandidos((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    },
    [colaboradoresState]
  )

  const handleAdicionar = useCallback((id: string) => {
    setAdicionandoEm(id)
    setNovoNome('')
    setNovaFuncao('')
  }, [])

  const handleConfirmarAdicao = useCallback(async () => {
    if (!adicionandoEm || !novoNome.trim() || !novaFuncao.trim()) return

    const criado = await adicionarColaboradorRapido(
      novoNome.trim(),
      novaFuncao.trim(),
      adicionandoEm
    )

    setColaboradoresState((prev) => [...prev, criado])

    setExpandidos((prev) => {
      const next = new Set(prev)
      next.add(adicionandoEm)
      return next
    })

    setAdicionandoEm(null)
    setNovoNome('')
    setNovaFuncao('')
  }, [adicionandoEm, novoNome, novaFuncao])

  const onNodeClick = useCallback(
    (_e: React.MouseEvent, node: Node) => {
      const d = node.data as unknown as NodeData
      if (d.colaborador) handleToggle(d.colaborador.id)
    },
    [handleToggle]
  )

  // Decorate nodes with callbacks and metadata
  const nodesDecorados = useMemo(
    () =>
      nodes.map((n) => {
        const d = n.data as unknown as NodeData
        return {
          ...n,
          data: {
            ...d,
            onToggle: handleToggle,
            onEditar: handleEditar,
            onExcluir: handleExcluir,
            onAdicionar: handleAdicionar,
            expandido: expandidos.has(n.id),
            temFilhos: obterSubordinados(colaboradoresState, n.id).length > 0,
          },
        }
      }),
    [nodes, handleToggle, handleEditar, handleExcluir, handleAdicionar, expandidos, colaboradoresState]
  )

  const lidereAdicionar = adicionandoEm
    ? colaboradoresState.find((c) => c.id === adicionandoEm)
    : null

  return (
    <div
      style={{ width: '100%', height: 'calc(100vh - 57px)' }}
      className="relative"
    >
      {/* Instructions */}
      <div className="absolute top-4 left-4 z-10 flex gap-3 text-xs text-zinc-400 pointer-events-none">
        <span>Clique no nó para expandir/recolher</span>
        <span>•</span>
        <span>Duplo clique para editar</span>
        <span>•</span>
        <span>Passe o mouse para ações</span>
        <span>•</span>
        <span>Arraste para mover</span>
      </div>

      {/* Count */}
      <div className="absolute top-4 right-4 z-10 text-xs text-zinc-400 bg-white/80 px-2 py-1 rounded">
        {visiveis.length} de {colaboradoresState.length} colaboradores visíveis
      </div>

      <ReactFlowProvider>
        <FlowInner
          nodes={nodesDecorados}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
        />
      </ReactFlowProvider>

      {/* Add modal */}
      {adicionandoEm && (
        <div
          className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center"
          onClick={() => setAdicionandoEm(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-6 w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-1">
              Adicionar Subordinado
            </h3>
            {lidereAdicionar && (
              <p className="text-sm text-zinc-500 mb-4">
                Líder: <span className="font-medium">{lidereAdicionar.nome}</span>
              </p>
            )}
            <input
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 mb-3 text-sm outline-none focus:border-blue-500"
              placeholder="Nome"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmarAdicao()}
              autoFocus
            />
            <input
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 mb-4 text-sm outline-none focus:border-blue-500"
              placeholder="Função / Cargo"
              value={novaFuncao}
              onChange={(e) => setNovaFuncao(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmarAdicao()}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setAdicionandoEm(null)}
                className="px-4 py-2 text-sm rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarAdicao}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={!novoNome.trim() || !novaFuncao.trim()}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
