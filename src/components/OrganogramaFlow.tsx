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
import type { Colaborador, Impacto, AcaoSimulacao, Avaliacao, MetricaMensal, RegraImpacto } from '@/lib/types'
import { Papel } from '@/lib/types'
import {
  atualizarColaboradorAction,
  excluirColaboradorComSubordinados,
  adicionarColaboradorRapido,
  aplicarSimulacaoAction,
  relocarColaboradorAction,
} from '@/lib/actions'
import { processarAcao, calcularCascataPromocoes, analisarEstadoSimulacao, obterDescendentes, obterSubordinados } from '@/lib/simulacao'
import type { SugestaoCascata, CandidatoSugerido } from '@/lib/simulacao'
import { getDadosSimulacao, salvarImpactosAction, carregarImpactosAction, limparImpactosAction } from '@/lib/simulacao-actions'
import SelectCargo from './SelectCargo'

interface NodeData {
  colaborador: Colaborador
  onToggle: (id: string) => void
  onEditar: (id: string, nome: string, funcao: string) => void
  onExcluir: (id: string) => void
  onAdicionar: (id: string) => void
  onSimularDemissao?: (id: string) => void
  onSimularPromocao?: (id: string) => void
  onContratar?: (id: string) => void
  onRelocar?: (id: string) => void
  expandido: boolean
  temFilhos: boolean
  modoSimulacao?: boolean
  modoVisual?: 'formal' | 'ludico'
  simulacaoVago?: boolean
  simulacaoPromovido?: boolean
  sugerido?: boolean
  editandoNodeId?: string | null
  clearEditando?: () => void
}

import {
  FaCrown, FaBullseye, FaChartLine, FaSearch, FaWrench,
  FaStar, FaCogs, FaHandshake, FaUser, FaDesktop, FaHeadset,
} from 'react-icons/fa'

const ICONE_POR_PAPEL: Record<string, React.ReactNode> = {
  CEO:               <FaCrown className="text-yellow-500" />,
  DIRETOR:           <FaBullseye className="text-red-500" />,
  GERENTE:           <FaChartLine className="text-blue-500" />,
  SUPERVISOR:        <FaSearch className="text-purple-500" />,
  GESTOR:            <FaWrench className="text-orange-500" />,
  LIDER:             <FaStar className="text-amber-400" />,
  OPERACIONAL:       <FaCogs className="text-zinc-500" />,
  RH:                <FaHandshake className="text-teal-500" />,
  COLABORADOR:       <FaUser className="text-sky-500" />,
  ADMIN_PLATAFORMA:  <FaDesktop className="text-indigo-500" />,
  ADMIN_SUPORTE:     <FaHeadset className="text-emerald-500" />,
}

function calcularNivel(colaboradores: Colaborador[], id: string): number {
  let nivel = 1
  let atual = colaboradores.find((c) => c.id === id)
  while (atual && atual.liderImediatoId) {
    nivel++
    atual = colaboradores.find((c) => c.id === atual!.liderImediatoId)
  }
  return nivel
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
  data: NodeData
}) {
  const {
    colaborador,
    onToggle,
    onEditar,
    onExcluir,
    onAdicionar,
    onSimularDemissao,
    onSimularPromocao,
    onContratar,
    onRelocar,
    expandido,
    temFilhos,
    modoSimulacao,
    modoVisual,
    simulacaoVago,
    simulacaoPromovido,
    sugerido,
  } = data
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState(colaborador.nome)
  const [funcao, setFuncao] = useState(colaborador.funcao)
  const nomeRef = useRef<HTMLInputElement>(null)
  const [hover, setHover] = useState(false)

  // Entrar em modo edição via duplo clique do ReactFlow
  useEffect(() => {
    if (data.editandoNodeId === colaborador.id && !editando) {
      setNome(colaborador.nome)
      setFuncao(colaborador.funcao)
      setEditando(true)
    }
  }, [data.editandoNodeId, colaborador.id, colaborador.nome, colaborador.funcao, editando])

  useEffect(() => {
    if (editando && nomeRef.current) nomeRef.current.focus()
  }, [editando])

  const handleSalvar = useCallback(() => {
    if (nome.trim() && funcao.trim()) {
      onEditar(colaborador.id, nome.trim(), funcao.trim())
    }
    setEditando(false)
    data.clearEditando?.()
  }, [nome, funcao, colaborador.id, onEditar, data])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSalvar()
      if (e.key === 'Escape') {
        setEditando(false)
        data.clearEditando?.()
      }
    },
    [handleSalvar, data]
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
        <SelectCargo
          value={funcao}
          onChange={(val) => setFuncao(val)}
          onBlur={handleSalvar}
          placeholder="Cargo"
          className="text-xs !px-1 !py-0 !border-zinc-300"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="!border-zinc-300"
        />
      </div>
    )
  }

  // ─── Modo Lúdico ──────────────────────────────────────
  if (modoVisual === 'ludico') {
    const avatarSize = 56
    const temFoto = !!colaborador.fotoUrl
    const ehVagoL = colaborador.status === 'vago'
    const bordaAvt = ehVagoL
      ? 'border-red-400'
      : simulacaoPromovido
      ? 'border-emerald-400'
      : 'border-zinc-300'

    return (
      <div
        className="group flex flex-col items-center gap-1 cursor-pointer select-none"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Handle type="target" position={Position.Top} className="!border-zinc-300" />

        {/* Avatar */}
        <div className="relative">
          {/* Badges */}
          {ehVagoL && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-semibold shadow-sm">
              VAGO
            </div>
          )}
          {simulacaoPromovido && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-semibold shadow-sm">
              PROMOVIDO
            </div>
          )}

          {/* Expand indicator */}
          {temFilhos && (
            <div
              className={`absolute -left-2 top-1/2 -translate-y-1/2 z-10 text-xs text-zinc-400 transition-transform duration-200 ${
                expandido ? 'rotate-90' : ''
              }`}
            >
              ▶
            </div>
          )}

          <div
            onClick={() => onToggle(colaborador.id)}
            className={`w-[${avatarSize}px] h-[${avatarSize}px] rounded-full border-2 ${bordaAvt} flex items-center justify-center overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow ${
              sugerido ? 'animate-pulse shadow-lg shadow-emerald-200/50 border-emerald-400' : ''
            }`}
            style={{ width: avatarSize, height: avatarSize }}
          >
            {ehVagoL ? (
              <span className="text-base font-bold text-red-500">?</span>
            ) : temFoto ? (
              <img
                src={colaborador.fotoUrl!}
                alt={colaborador.nome}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl leading-none">{ICONE_POR_PAPEL[colaborador.papel] || <FaUser className="text-sky-500" />}</span>
            )}
          </div>
        </div>

        {/* Nome + Cargo */}
        <div
          className={`text-center min-w-[80px] max-w-[120px] ${ehVagoL ? 'opacity-60' : ''}`}
        >
          {editando ? (
            <div className="flex flex-col gap-0.5">
              <input
                ref={nomeRef}
                className="w-full text-[10px] font-semibold text-center text-zinc-900 bg-white border border-zinc-300 rounded px-0.5 outline-none"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSalvar}
              />
              <SelectCargo
                value={funcao}
                onChange={(val) => setFuncao(val)}
                onBlur={handleSalvar}
                placeholder="Cargo"
                className="text-[9px] !px-0.5 !py-0 !border-zinc-300 text-center"
              />
            </div>
          ) : (
            <>
              <div className={`text-[11px] font-semibold leading-tight truncate ${
                ehVagoL ? 'text-red-500' : simulacaoPromovido ? 'text-emerald-700' : 'text-zinc-800'
              }`}>
                {ehVagoL ? 'VAGO' : colaborador.nome}
              </div>
              <div className={`text-[9px] leading-tight truncate ${
                ehVagoL ? 'text-red-400' : simulacaoPromovido ? 'text-emerald-600' : 'text-zinc-400'
              }`}>
                {colaborador.funcao}
              </div>
            </>
          )}
        </div>

        {/* Hover actions */}
        {hover && (
          <div className="absolute -top-2 right-0 z-20 flex gap-1">
            {modoSimulacao && ehVagoL ? (
              <>
                <button onClick={(e) => { e.stopPropagation(); onSimularPromocao?.(colaborador.id) }}
                  className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] hover:bg-amber-600 shadow-sm" title="Preencher cargo vago">↑</button>
                <button onClick={(e) => { e.stopPropagation(); onContratar?.(colaborador.id) }}
                  className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] hover:bg-emerald-600 shadow-sm" title="Contratar nova pessoa">+</button>
              </>
            ) : modoSimulacao ? (
              <>
                <button onClick={(e) => { e.stopPropagation(); onSimularDemissao?.(colaborador.id) }}
                  className="flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[9px] hover:bg-red-600 shadow-sm" title="Simular demissão">↓</button>
                <button onClick={(e) => { e.stopPropagation(); onSimularPromocao?.(colaborador.id) }}
                  className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] hover:bg-amber-600 shadow-sm" title="Promover">↑</button>
                <button onClick={(e) => { e.stopPropagation(); onRelocar?.(colaborador.id) }}
                  className="flex items-center justify-center w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] hover:bg-violet-600 shadow-sm" title="Relocar">⟷</button>
              </>
            ) : (
              <>
                <button onClick={(e) => { e.stopPropagation(); onAdicionar(colaborador.id) }}
                  className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] hover:bg-emerald-600 shadow-sm" title="Adicionar subordinado">+</button>
                <button onClick={(e) => { e.stopPropagation(); onRelocar?.(colaborador.id) }}
                  className="flex items-center justify-center w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] hover:bg-violet-600 shadow-sm" title="Relocar">⟷</button>
                <button onClick={(e) => { e.stopPropagation(); onExcluir(colaborador.id) }}
                  className="flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[9px] hover:bg-red-600 shadow-sm" title="Excluir">×</button>
              </>
            )}
          </div>
        )}

        <Handle type="source" position={Position.Bottom} className="!border-zinc-300" />
      </div>
    )
  }

  const ehVago = colaborador.status === 'vago'
  const bordaCor = ehVago
    ? 'border-red-500 bg-red-50'
    : simulacaoPromovido
    ? 'border-emerald-500 bg-emerald-50'
    : sugerido
    ? 'border-emerald-400 bg-emerald-50/80 animate-pulse shadow-lg shadow-emerald-200/50'
    : modoSimulacao
    ? 'border-amber-400 bg-amber-50/50'
    : 'border-zinc-200 bg-white'

  return (
    <div
      className={`group relative rounded-lg border px-4 py-3 shadow-sm min-w-[160px] hover:shadow-md transition-shadow ${bordaCor}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!border-zinc-300"
      />

      {/* Status badges */}
      {ehVago && (
        <div className="absolute -top-2.5 left-2 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-semibold shadow-sm">
          VAGO
        </div>
      )}
      {simulacaoPromovido && (
        <div className="absolute -top-2.5 left-2 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-semibold shadow-sm">
          PROMOVIDO
        </div>
      )}
      {sugerido && !ehVago && (
        <div className="absolute -top-2.5 right-2 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-400 text-white text-[10px] font-semibold shadow-sm animate-pulse">
          ↑ SUGERIDO
        </div>
      )}

      {/* Expand/collapse area */}
      <div
        className="flex items-center gap-2 cursor-pointer"
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
          {ehVago ? (
            <>
              <div className="text-sm font-bold text-red-600 uppercase tracking-wider">VAGO</div>
              <div className="text-xs text-red-400 truncate">{colaborador.funcao}</div>
            </>
          ) : (
            <>
              <div className={`text-sm font-semibold truncate ${simulacaoPromovido ? 'text-emerald-700' : 'text-zinc-900'}`}>
                {colaborador.nome}
              </div>
              <div className={`text-xs truncate ${simulacaoPromovido ? 'text-emerald-600' : 'text-zinc-500'}`}>
                {colaborador.funcao}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hover actions */}
      {hover && (
        <div className="absolute -top-3 right-2 z-20 flex gap-1">
          {modoSimulacao && ehVago ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onSimularPromocao?.(colaborador.id) }}
                className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs hover:bg-amber-600 shadow-sm"
                title="Preencher cargo vago"
              >
                ↑
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onContratar?.(colaborador.id) }}
                className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-xs hover:bg-emerald-600 shadow-sm"
                title="Contratar nova pessoa"
              >
                +
              </button>
            </>
          ) : modoSimulacao ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onSimularDemissao?.(colaborador.id) }}
                className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs hover:bg-red-600 shadow-sm"
                title="Simular demissão"
              >
                ↓
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onSimularPromocao?.(colaborador.id) }}
                className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs hover:bg-amber-600 shadow-sm"
                title="Promover colaborador"
              >
                ↑
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onRelocar?.(colaborador.id) }}
                className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500 text-white text-xs hover:bg-violet-600 shadow-sm"
                title="Relocar (mudar líder)"
              >
                ⟷
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onAdicionar(colaborador.id) }}
                className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-xs hover:bg-emerald-600 shadow-sm"
                title="Adicionar subordinado"
              >
                +
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onRelocar?.(colaborador.id) }}
                className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500 text-white text-xs hover:bg-violet-600 shadow-sm"
                title="Relocar (mudar líder)"
              >
                ⟷
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onExcluir(colaborador.id) }}
                className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs hover:bg-red-600 shadow-sm"
                title="Excluir"
              >
                ×
              </button>
            </>
          )}
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
  const { nodes, edges, onNodesChange, onEdgesChange, onNodeClick, onNodeDoubleClick, onEdgeClick } = props
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
      onNodeDoubleClick={onNodeDoubleClick}
      onEdgeClick={onEdgeClick}
      edgesReconnectable={false}
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
  aiSugestaoCandidatos = false,
}: {
  colaboradores: Colaborador[]
  aiSugestaoCandidatos?: boolean
}) {
  const [colaboradoresState, setColaboradoresState] = useState(colaboradores)
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set())
  const [adicionandoEm, setAdicionandoEm] = useState<string | null>(null)
  const [novoNome, setNovoNome] = useState('')
  const [novaFuncao, setNovaFuncao] = useState('')
  const [novoCpf, setNovoCpf] = useState('')
  const [transferirSubordinados, setTransferirSubordinados] = useState(false)

  // Edição inline (duplo clique)
  const [editandoNodeId, setEditandoNodeId] = useState<string | null>(null)
  const clearEditando = useCallback(() => setEditandoNodeId(null), [])

  // Visual
  const [modoVisual, setModoVisual] = useState<'formal' | 'ludico'>('formal')

  // Simulação
  const [modoSimulacao, setModoSimulacao] = useState(false)
  const [simulando, setSimulando] = useState<Colaborador[] | null>(null)
  const [estadoOriginal, setEstadoOriginal] = useState<Colaborador[] | null>(null)
  const [acoesSimulacao, setAcoesSimulacao] = useState<AcaoSimulacao[]>([])
  const [impactosSimulacao, setImpactosSimulacao] = useState<Impacto[]>([])
  const [dadosSimulacao, setDadosSimulacao] = useState<{ avaliacoes: Avaliacao[]; metricas: MetricaMensal[]; regras: RegraImpacto[]; scores?: Record<string, any> } | null>(null)
  const [mostrarImpactos, setMostrarImpactos] = useState(false)
  const [sugestoesCascata, setSugestoesCascata] = useState<SugestaoCascata[]>([])
  const [preencherVaga, setPreencherVaga] = useState<{
    cargoVagoId: string
    cargoVagoFuncao: string
    candidatos: CandidatoSugerido[]
  } | null>(null)
  const [promocaoModal, setPromocaoModal] = useState<{
    colaboradorId: string
    nome: string
    funcaoAtual: string
    novoLiderId: string | null
    novoCargo: string
  } | null>(null)
  const [contratarModal, setContratarModal] = useState<{
    cargoVagoId: string
    cargoVagoFuncao: string
    nome: string
    funcao: string
  } | null>(null)
  const [impactoManual, setImpactoManual] = useState('')
  const [buscaCandidato, setBuscaCandidato] = useState('')
  const [subordinadosModal, setSubordinadosModal] = useState<{
    colaborador: Colaborador
    subordinados: CandidatoSugerido[]
  } | null>(null)
  const [relocarModal, setRelocarModal] = useState<{
    colaboradorId: string
    nome: string
    funcaoAtual: string
    liderAtualId: string | null
  } | null>(null)

  useEffect(() => {
    if (modoSimulacao) {
      setEstadoOriginal(colaboradoresState)
      if (!dadosSimulacao) {
        getDadosSimulacao().then(setDadosSimulacao)
        carregarImpactosAction().then((saved) => {
          if (saved.length > 0) setImpactosSimulacao(saved)
        })
      }
    }
  }, [modoSimulacao, dadosSimulacao])

  function resetarSimulacao() {
    // Mantém simulando, acoes, impactos para VAGO ficar visível fora do modo simulação
    setPromocaoModal(null)
    setPreencherVaga(null)
    setContratarModal(null)
    setSugestoesCascata([])
    if (!modoSimulacao) {
      setDadosSimulacao(null)
      limparImpactosAction()
    }
  }

  function limparSimulacaoCompleta() {
    setSimulando(null)
    setAcoesSimulacao([])
    setImpactosSimulacao([])
    resetarSimulacao()
  }

  useEffect(() => {
    if (!modoSimulacao) resetarSimulacao()
  }, [modoSimulacao])

  // Populate initial expandidos so the CEO root is visible (roots have no parent)
  // When expandidos is empty, only roots are shown. That's correct: only CEO initially.

  const dadosVisiveis = simulando ?? colaboradoresState

  const visiveis = useMemo(
    () => getVisible(dadosVisiveis, expandidos),
    [dadosVisiveis, expandidos]
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
    setExpandidos((prev) => toggleExpanded(prev, id, dadosVisiveis))
  }, [dadosVisiveis])

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

      try {
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
      } catch (err) {
        console.error('Erro ao excluir:', err)
        alert(err instanceof Error ? err.message : 'Erro ao excluir colaborador. Tente novamente.')
      }
    },
    [colaboradoresState]
  )

  const handleAdicionar = useCallback((id: string) => {
    setAdicionandoEm(id)
    setNovoNome('')
    setNovaFuncao('')
    setNovoCpf('')
  }, [])

  // ---------- Simulação callbacks ----------

  const handleSimularDemissao = useCallback((id: string) => {
    if (!dadosSimulacao || !estadoOriginal) return

    const base = simulando ?? colaboradoresState

    const acao: AcaoSimulacao = {
      tipo: 'demissao',
      colaboradorId: id,
      descricao: `Demissão simulada`,
    }

    const resultado = processarAcao(
      base,
      acao,
      null,
      dadosSimulacao.avaliacoes,
      dadosSimulacao.metricas,
      dadosSimulacao.regras
    )

    // Calcular cascata de promoções sugeridas
    const cascata = calcularCascataPromocoes(
      resultado.colaboradores,
      id,
      dadosSimulacao.avaliacoes,
      dadosSimulacao.metricas
    )

    setSimulando(resultado.colaboradores)
    setAcoesSimulacao((prev) => [...prev, acao])

    // Recalcular todos os impactos com base no estado atual
    const novosImpactos = analisarEstadoSimulacao(
      estadoOriginal,
      resultado.colaboradores,
      dadosSimulacao.avaliacoes,
      dadosSimulacao.metricas,
        dadosSimulacao.regras,
        dadosSimulacao.scores
      )
      setImpactosSimulacao(novosImpactos)
      setSugestoesCascata(cascata)
    }, [simulando, colaboradoresState, dadosSimulacao, estadoOriginal])

  const handleContratar = useCallback((id: string) => {
    const base = simulando ?? colaboradoresState
    const col = base.find((c) => c.id === id)
    if (!col) return
    setContratarModal({
      cargoVagoId: id,
      cargoVagoFuncao: col.funcao,
      nome: '',
      funcao: col.funcao,
    })
  }, [simulando, colaboradoresState])

  const handleRelocar = useCallback((id: string) => {
    const base = simulando ?? colaboradoresState
    const col = base.find((c) => c.id === id)
    if (!col) return
    setRelocarModal({
      colaboradorId: id,
      nome: col.nome,
      funcaoAtual: col.funcao,
      liderAtualId: col.liderImediatoId,
    })
  }, [simulando, colaboradoresState])

  const handleConfirmarRelocar = useCallback(async (novoLiderId: string | null) => {
    if (!relocarModal) return

    if (modoSimulacao) {
      if (!dadosSimulacao || !estadoOriginal) return

      const base = simulando ?? colaboradoresState

      const acao: AcaoSimulacao = {
        tipo: 'realocacao',
        colaboradorId: relocarModal.colaboradorId,
        descricao: `Relocar ${relocarModal.nome} para novo líder`,
        novoLiderId: novoLiderId,
      }

      const resultado = processarAcao(
        base,
        acao,
        null,
        dadosSimulacao.avaliacoes,
        dadosSimulacao.metricas,
        dadosSimulacao.regras
      )

      setSimulando(resultado.colaboradores)
      setAcoesSimulacao((prev) => [...prev, acao])

      const novosImpactos = analisarEstadoSimulacao(
        estadoOriginal,
        resultado.colaboradores,
        dadosSimulacao.avaliacoes,
        dadosSimulacao.metricas,
        dadosSimulacao.regras,
        dadosSimulacao.scores
      )
      setImpactosSimulacao(novosImpactos) 
    } else {
      // Modo normal: persiste no banco imediatamente
      await relocarColaboradorAction(relocarModal.colaboradorId, novoLiderId)
      setColaboradoresState((prev) =>
        prev.map((c) =>
          c.id === relocarModal.colaboradorId
            ? { ...c, liderImediatoId: novoLiderId }
            : c
        )
      )
    }

    setRelocarModal(null)
  }, [relocarModal, modoSimulacao, simulando, colaboradoresState, dadosSimulacao, estadoOriginal])

  const handleSimularPromocao = useCallback((id: string) => {
    const base = simulando ?? colaboradoresState
    const col = base.find((c) => c.id === id)
    if (!col) return

    // Se o líder imediato do colaborador é um VAGO, redireciona para o VAGO
    const targetId = (col.status !== 'vago' && col.liderImediatoId)
      ? (() => {
          const leader = base.find((c) => c.id === col.liderImediatoId)
          return leader?.status === 'vago' ? leader.id : null
        })()
      : null

    const vagoId = targetId ?? (col.status === 'vago' ? id : null)
    if (!vagoId) {
      // ↑ em nó normal (líder não é VAGO) → promoção direta
      setPromocaoModal({
        colaboradorId: id,
        nome: col.nome,
        funcaoAtual: col.funcao,
        novoLiderId: col.liderImediatoId,
        novoCargo: col.funcao,
      })
      return
    }

    // ↑ em nó vago (ou redirecionado para VAGO) → preencher vaga com descendentes
    if (!dadosSimulacao) return
    const vagoCol = base.find((c) => c.id === vagoId)
    if (!vagoCol) return

    // Se IA estiver habilitada, tenta usar sugestão inteligente
    if (aiSugestaoCandidatos) {
      fetch('/api/ai/sugerir-candidatos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cargoVago: vagoCol.funcao, liderVagoId: vagoId }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.candidatos && data.candidatos.length > 0) {
            const candidatosIA = data.candidatos.map((c: any) => ({
              colaborador: base.find((b: any) => b.id === c.id) ?? { id: c.id, nome: c.nome, funcao: c.funcao },
              mediaAvaliacoes: c.mediaAvaliacoes,
              perfil: c.perfil,
              score: c.scoreIA ?? c.score,
            }))
            setPreencherVaga({
              cargoVagoId: vagoId,
              cargoVagoFuncao: vagoCol.funcao,
              candidatos: candidatosIA,
            })
            return
          }
          // Se IA retornou vazio, cai no fallback
          calcularCandidatosFallback(base, vagoId, vagoCol, dadosSimulacao)
        })
        .catch(() => {
          calcularCandidatosFallback(base, vagoId, vagoCol, dadosSimulacao)
        })
    } else {
      calcularCandidatosFallback(base, vagoId, vagoCol, dadosSimulacao)
    }
  }, [simulando, colaboradoresState, dadosSimulacao, aiSugestaoCandidatos])

  function calcularCandidatosFallback(
    base: Colaborador[],
    vagoId: string,
    vagoCol: Colaborador,
    dados: { avaliacoes: Avaliacao[]; metricas: MetricaMensal[] }
  ) {
    const descendentes = obterDescendentes(base, vagoId).filter((c) => c.status !== 'vago')
    const candidatos = descendentes.length > 0
      ? descendentes
          .map((c) => {
            const avaliacoesCol = dados.avaliacoes.filter((a) => a.avaliadoId === c.id)
            const notas = avaliacoesCol.flatMap((a) => a.criterios.map((cr) => cr.nota))
            const media = notas.length > 0 ? notas.reduce((s, n) => s + n, 0) / notas.length : 0
            const metricasCol = dados.metricas.filter((m) => m.colaboradorId === c.id)
            const ultimaMeta = metricasCol.length > 0
              ? metricasCol.reduce((a, b) => (a.ano > b.ano || (a.ano === b.ano && a.mes > b.mes) ? a : b))
              : null
            const perfil = ultimaMeta
              ? (ultimaMeta.faltasInjustificadas > 2 || ultimaMeta.horasAtraso > 4 ? 'Ruim' : 'Bom')
              : 'desconhecido'
            const score = (media * 2) + (perfil === 'Bom' ? 1.5 : perfil === 'Ruim' ? -1 : 0) + (obterSubordinados(base, c.id).length * 0.5)
            return { colaborador: c, mediaAvaliacoes: media, perfil, score }
          })
          .sort((a, b) => b.score - a.score)
      : []
    setPreencherVaga({
      cargoVagoId: vagoId,
      cargoVagoFuncao: vagoCol.funcao,
      candidatos,
    })
  }

  const handleConfirmarPreencherVaga = useCallback((candidatoId: string) => {
    if (!preencherVaga || !dadosSimulacao || !estadoOriginal) return

    const base = simulando ?? colaboradoresState

    const acao: AcaoSimulacao = {
      tipo: 'promocao',
      colaboradorId: preencherVaga.cargoVagoId,
      descricao: `Preencher vaga de ${preencherVaga.cargoVagoFuncao}`,
    }

    const resultado = processarAcao(
      base,
      acao,
      candidatoId,
      dadosSimulacao.avaliacoes,
      dadosSimulacao.metricas,
      dadosSimulacao.regras
    )

    setSimulando(resultado.colaboradores)
    setAcoesSimulacao((prev) => [...prev, acao])

    // Recalcular todos os impactos com base no estado atual
    const novosImpactos = analisarEstadoSimulacao(
      estadoOriginal,
      resultado.colaboradores,
      dadosSimulacao.avaliacoes,
      dadosSimulacao.metricas,
      dadosSimulacao.regras
    )
    setImpactosSimulacao(novosImpactos)

    // Calcular cascata para o VAGO criado na posição antiga do promovido
    const vagoId = `vago_${candidatoId}`
    const cascata = resultado.colaboradores.some((c) => c.id === vagoId)
      ? calcularCascataPromocoes(
          resultado.colaboradores,
          vagoId,
          dadosSimulacao.avaliacoes,
          dadosSimulacao.metricas
        )
      : []
    setSugestoesCascata(cascata)

    // Expandir o nó do promovido e o VAGO cascata
    setExpandidos((prev) => {
      const next = new Set(prev)
      next.add(candidatoId)
      if (resultado.colaboradores.some((c) => c.id === vagoId)) {
        next.add(vagoId)
      }
      return next
    })

    setPreencherVaga(null)
  }, [preencherVaga, simulando, colaboradoresState, dadosSimulacao, estadoOriginal])

  const handleConfirmarContratar = useCallback(() => {
    if (!contratarModal || !contratarModal.nome.trim() || !contratarModal.funcao.trim()) return

    const base = simulando ?? colaboradoresState
    const vago = base.find((c) => c.id === contratarModal.cargoVagoId)
    if (!vago) return

    const novoId = `contratado_${Date.now()}`
    const novoColaborador: Colaborador = {
      id: novoId,
      empresaId: vago.empresaId,
      nome: contratarModal.nome.trim(),
      funcao: contratarModal.funcao.trim(),
      papel: Papel.OPERACIONAL,
      liderImediatoId: vago.liderImediatoId,
      createdAt: new Date().toISOString(),
      status: 'ativo',
    }

    const novosColaboradores = base
      .filter((c) => c.id !== contratarModal.cargoVagoId)
      .concat(novoColaborador)

    // Subordinados do vago passam a responder ao novo contratado
    for (const c of novosColaboradores) {
      if (c.liderImediatoId === contratarModal.cargoVagoId) {
        c.liderImediatoId = novoId
      }
    }

    // Se o cargo vago era o topo (CEO), transfere todos os órfãos para o novo contratado
    if (vago.liderImediatoId === null) {
      for (const c of novosColaboradores) {
        if (c.liderImediatoId === null && c.id !== novoId && c.status !== 'vago') {
          c.liderImediatoId = novoId
        }
      }
    }

    const acao: AcaoSimulacao = {
      tipo: 'promocao',
      colaboradorId: contratarModal.cargoVagoId,
      descricao: `Contratação de ${contratarModal.nome.trim()} para ${contratarModal.funcao.trim()}`,
    }

    setSimulando(novosColaboradores)
    setAcoesSimulacao((prev) => [...prev, acao])

    // Recalcular impactos
    if (estadoOriginal && dadosSimulacao) {
      const novosImpactos = analisarEstadoSimulacao(
        estadoOriginal,
        novosColaboradores,
        dadosSimulacao.avaliacoes,
        dadosSimulacao.metricas,
        dadosSimulacao.regras,
        dadosSimulacao.scores
      )
      setImpactosSimulacao(novosImpactos) 
    }

    setContratarModal(null)
    setSugestoesCascata([])
  }, [contratarModal, simulando, colaboradoresState, dadosSimulacao, estadoOriginal])

  const handleConfirmarPromocaoDireta = useCallback(() => {
    if (!promocaoModal || !dadosSimulacao || !estadoOriginal) return
    if (promocaoModal.novoLiderId === undefined) return

    const base = simulando ?? colaboradoresState

    const acao: AcaoSimulacao = {
      tipo: 'promocao',
      colaboradorId: promocaoModal.colaboradorId,
      descricao: `Promoção de ${promocaoModal.nome}`,
      novoLiderId: promocaoModal.novoLiderId,
      novoCargo: promocaoModal.novoCargo,
    }

    const resultado = processarAcao(
      base,
      acao,
      null,
      dadosSimulacao.avaliacoes,
      dadosSimulacao.metricas,
      dadosSimulacao.regras
    )

    setSimulando(resultado.colaboradores)
    setAcoesSimulacao((prev) => [...prev, acao])

    // Recalcular todos os impactos com base no estado atual
    const novosImpactos = analisarEstadoSimulacao(
      estadoOriginal,
      resultado.colaboradores,
      dadosSimulacao.avaliacoes,
      dadosSimulacao.metricas,
      dadosSimulacao.regras
    )
    setImpactosSimulacao(novosImpactos)

    // Expandir nó VAGO criado no lugar do promovido
    setExpandidos((prev) => {
      const next = new Set(prev)
      const vagoId = `vago_${promocaoModal.colaboradorId}`
      if (resultado.colaboradores.some((c) => c.id === vagoId)) {
        next.add(vagoId)
      }
      return next
    })

    setPromocaoModal(null)
  }, [promocaoModal, simulando, colaboradoresState, dadosSimulacao, estadoOriginal])

  // ─── Clique na edge → abre relocar para o subordinado ───

  const handleEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    const base = simulando ?? colaboradoresState
    const targetNode = base.find((c) => c.id === edge.target)
    if (!targetNode || targetNode.status === 'vago') return

    // Abre o modal de relocar para o nó alvo (subordinado)
    setRelocarModal({
      colaboradorId: targetNode.id,
      nome: targetNode.nome,
      funcaoAtual: targetNode.funcao,
      liderAtualId: targetNode.liderImediatoId,
    })
  }, [simulando, colaboradoresState])

  const handleAdicionarImpactoManual = useCallback(() => {
    if (!impactoManual.trim()) return
    setImpactosSimulacao((prev) => [...prev, {
      id: `manual_${Date.now()}`,
      tipo: 'neutro',
      titulo: 'Observação',
      descricao: impactoManual.trim(),
    }])
    setImpactoManual('')
  }, [impactoManual])

  const [aplicandoSimulacao, setAplicandoSimulacao] = useState(false)

  const handleAplicarSimulacao = useCallback(async () => {
    if (!simulando || aplicandoSimulacao) return
    setAplicandoSimulacao(true)
    try {
      await salvarImpactosAction(impactosSimulacao)
      await aplicarSimulacaoAction(simulando)
      setColaboradoresState(simulando)
      setSimulando(null)    // ← CRÍTICO: limpa para dadosVisiveis usar colaboradoresState
      setModoSimulacao(false)
      resetarSimulacao()
    } catch (err) {
      console.error('Erro ao aplicar simulação:', err)
    } finally {
      setAplicandoSimulacao(false)
    }
  }, [simulando, impactosSimulacao, aplicandoSimulacao])

  const handleConfirmarAdicao = useCallback(async () => {
    if (!adicionandoEm || !novoNome.trim() || !novaFuncao.trim()) return

    try {
      const criado = await adicionarColaboradorRapido(
        novoNome.trim(),
        novaFuncao.trim(),
        adicionandoEm,
        novoCpf.trim() || undefined
      )

      // Se marcou "Transferir subordinados", move todos os subordinados diretos do líder para o novo gestor
      if (transferirSubordinados) {
        const subordinadosAtuais = obterSubordinados(colaboradoresState, adicionandoEm)
        for (const sub of subordinadosAtuais) {
          await relocarColaboradorAction(sub.id, criado.id)
        }
        setColaboradoresState((prev) =>
          prev.map((c) =>
            c.liderImediatoId === adicionandoEm
              ? { ...c, liderImediatoId: criado.id }
              : c
          )
        )
      }

      setColaboradoresState((prev) => [...prev, criado])

      setExpandidos((prev) => {
        const next = new Set(prev)
        next.add(adicionandoEm)
        return next
      })

      setAdicionandoEm(null)
      setNovoNome('')
      setNovaFuncao('')
      setTransferirSubordinados(false)
    } catch (err) {
      console.error('Erro ao adicionar colaborador:', err)
      alert(err instanceof Error ? err.message : 'Erro ao adicionar colaborador. Tente atualizar a página.')
    }
  }, [adicionandoEm, novoNome, novaFuncao, transferirSubordinados, colaboradoresState])

  const onNodeClick = useCallback(
    (_e: React.MouseEvent, node: Node) => {
      const d = node.data as unknown as NodeData
      if (!d.colaborador) return

      const col = dadosVisiveis.find((c) => c.id === d.colaborador.id)
      if (!col || col.status === 'vago') {
        handleToggle(col?.id ?? d.colaborador.id)
        return
      }

      const nivel = calcularNivel(dadosVisiveis, col.id)
      const subordinados = obterSubordinados(dadosVisiveis, col.id)

      // No 4º nível ou mais, se tiver subordinados, abre modal de promoção
      if (nivel >= 4 && subordinados.length > 0 && dadosSimulacao) {
        const candidatos = subordinados
          .filter((s) => s.status !== 'vago')
          .map((s) => {
            const notas = dadosSimulacao.avaliacoes
              .filter((a) => a.avaliadoId === s.id)
              .flatMap((a) => a.criterios.map((cr) => cr.nota))
            const media = notas.length > 0 ? notas.reduce((sum, n) => sum + n, 0) / notas.length : 0
            const metricasCol = dadosSimulacao.metricas.filter((m) => m.colaboradorId === s.id)
            const ultimaMeta = metricasCol.length > 0
              ? metricasCol.reduce((a, b) => (a.ano > b.ano || (a.ano === b.ano && a.mes > b.mes) ? a : b))
              : null
            const perfil = ultimaMeta
              ? (ultimaMeta.faltasInjustificadas > 2 || ultimaMeta.horasAtraso > 4 ? 'Ruim' : 'Bom')
              : 'desconhecido'
            const score = (media * 2) + (perfil === 'Bom' ? 1.5 : perfil === 'Ruim' ? -1 : 0) + (obterSubordinados(dadosVisiveis, s.id).length * 0.5)
            return { colaborador: s, mediaAvaliacoes: media, perfil, score }
          })
          .sort((a, b) => b.score - a.score)
        setSubordinadosModal({ colaborador: col, subordinados: candidatos })
      } else {
        handleToggle(col.id)
      }
    },
    [handleToggle, dadosVisiveis, dadosSimulacao]
  )

  const onNodeDoubleClick = useCallback(
    (_e: React.MouseEvent, node: Node) => {
      const d = node.data as unknown as NodeData
      if (!d.colaborador || d.colaborador.status === 'vago') return
      setEditandoNodeId(node.id)
    },
    []
  )

  const idsPromovidos = new Set(
    acoesSimulacao.filter((a) => a.tipo === 'promocao' && a.novoCargo).map((a) => a.colaboradorId)
  )
  const idsSugeridos = new Set(sugestoesCascata.map((s) => s.sugeridoId))

  // Decorate nodes with callbacks and metadata
  const nodesDecorados = useMemo(
    () =>
      nodes.map((n) => {
        const d = n.data as unknown as NodeData
        const col = colaboradoresState.find((c) => c.id === n.id)
        const simCol = simulando?.find((c) => c.id === n.id)
        const colData = simCol ?? col ?? d.colaborador
        const vago = colData.status === 'vago'
        const promovido = idsPromovidos.has(n.id)
        const sugerido = idsSugeridos.has(n.id)
        return {
          ...n,
          data: {
            ...d,
            colaborador: colData,
            onToggle: handleToggle,
            onEditar: handleEditar,
            onExcluir: handleExcluir,
            onAdicionar: handleAdicionar,
            onSimularDemissao: handleSimularDemissao,
            onSimularPromocao: handleSimularPromocao,
            onContratar: handleContratar,
            onRelocar: handleRelocar,
            expandido: expandidos.has(n.id),
            temFilhos: obterSubordinados(dadosVisiveis, n.id).length > 0,
            modoSimulacao,
            modoVisual,
            simulacaoVago: vago,
            simulacaoPromovido: promovido,
            sugerido,
            editandoNodeId,
            clearEditando,
          },
        }
      }),
    [nodes, handleToggle, handleEditar, handleExcluir, handleAdicionar, handleSimularDemissao, handleSimularPromocao, handleContratar, handleRelocar, expandidos, dadosVisiveis, colaboradoresState, simulando, modoSimulacao, modoVisual, idsPromovidos, idsSugeridos, editandoNodeId, clearEditando]
  )

  // ─── Expandir/Recolher Tudo ────────────────────────────
  const todosExpandidos = useMemo(
    () => expandidos.size > 0 && dadosVisiveis.every((c) => c.liderImediatoId ? expandidos.has(c.liderImediatoId) : true),
    [expandidos, dadosVisiveis]
  )

  function toggleExpandirTudo() {
    if (expandidos.size === 0) {
      // Expandir todos: adiciona IDs de todos que têm filhos
      const todosIds = new Set<string>()
      for (const col of dadosVisiveis) {
        const temFilhos = dadosVisiveis.some((c) => c.liderImediatoId === col.id)
        if (temFilhos) todosIds.add(col.id)
      }
      setExpandidos(todosIds)
    } else {
      // Recolher todos
      setExpandidos(new Set())
    }
  }

  const lidereAdicionar = adicionandoEm
    ? colaboradoresState.find((c) => c.id === adicionandoEm)
    : null

  const totalImpactos = impactosSimulacao.length
  const impactosPositivos = impactosSimulacao.filter((i) => i.tipo === 'positivo').length
  const impactosNegativos = impactosSimulacao.filter((i) => i.tipo === 'negativo').length
  const alertaCor = impactosNegativos > 0 ? 'bg-red-500' : impactosPositivos > 0 ? 'bg-amber-500' : 'bg-zinc-400'

  return (
    <div
      style={{ width: '100%', height: 'calc(100vh - 57px)' }}
      className="relative"
    >
      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          {modoSimulacao ? (
            <>
              <span className="text-amber-600 font-semibold">🔮 MODO SIMULAÇÃO</span>
              <span>•</span>
              <span>↓ demitir</span>
              <span>•</span>
              <span>↑ promover</span>
              <span>•</span>
              <span>⟷ religar</span>
              <span>•</span>
              <span>clique na conexão para religar</span>
              <span>•</span>
              <span>Nenhum dado é salvo até aplicar</span>
            </>
          ) : (
            <>
              <span>Clique no nó para expandir/recolher</span>
              <span>•</span>
              <span>Duplo clique para editar</span>
              <span>•</span>
              <span>Passe o mouse para ações</span>
              <span>•</span>
              <span>Arraste nó para mover</span>
              <span>•</span>
              <span>Clique na conexão para religar</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <button
            onClick={() => setModoSimulacao((v) => !v)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              modoSimulacao
                ? 'bg-amber-100 border-amber-400 text-amber-700 hover:bg-amber-200'
                : 'bg-white border-zinc-300 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            {modoSimulacao ? '🔮 Sair da Simulação' : '🔮 Simular'}
          </button>

          {/* Visual toggle: Formal / Lúdico */}
          <button
            onClick={() => setModoVisual((v) => (v === 'formal' ? 'ludico' : 'formal'))}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              modoVisual === 'ludico'
                ? 'bg-fuchsia-100 border-fuchsia-400 text-fuchsia-700 hover:bg-fuchsia-200'
                : 'bg-white border-zinc-300 text-zinc-600 hover:bg-zinc-50'
            }`}
            title="Alternar entre visual formal e lúdico"
          >
            {modoVisual === 'ludico' ? '🎨 Formal' : '🎨 Lúdico'}
          </button>

          {/* Expandir/Recolher Tudo */}
          <button
            onClick={toggleExpandirTudo}
            className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-50 transition-colors bg-white"
            title={expandidos.size === 0 ? 'Expandir todos os nós' : 'Recolher todos os nós'}
          >
            {expandidos.size === 0 ? '⬇ Expandir Tudo' : '⬆ Recolher Tudo'}
          </button>

          {/* Count */}
          <div className="text-xs text-zinc-400 bg-white/80 px-2 py-1 rounded border border-zinc-200">
            {visiveis.length} de {dadosVisiveis.length}
          </div>
        </div>
      </div>

      {/* Simulation action bar */}
      {modoSimulacao && (
        <div className="absolute top-14 left-4 right-4 z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {acoesSimulacao.length > 0 && (
              <>
                <span className="text-xs text-zinc-500">
                  {acoesSimulacao.length} aç{'ões'} simuladas
                </span>
                <button
                  onClick={handleAplicarSimulacao}
                  disabled={aplicandoSimulacao}
                  className="px-3 py-1 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                >
                  {aplicandoSimulacao ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Aplicando...
                    </>
                  ) : (
                    '✓ Aplicar Simulação'
                  )}
                </button>
                <button
                  onClick={limparSimulacaoCompleta}
                  className="px-3 py-1 text-xs rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  ✗ Descartar
                </button>
              </>
            )}
          </div>

          {/* Impact indicator */}
          {totalImpactos > 0 && (
            <button
              onClick={() => setMostrarImpactos(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs text-white rounded-lg shadow-sm transition-colors ${alertaCor} hover:opacity-90`}
            >
              <span className="font-semibold">{totalImpactos}</span>
              <span>impacto{totalImpactos !== 1 ? 's' : ''}</span>
              {impactosNegativos > 0 && (
                <span className="text-white/80">({impactosNegativos} negativo{impactosNegativos !== 1 ? 's' : ''})</span>
              )}
              {impactosPositivos > 0 && impactosNegativos === 0 && (
                <span className="text-white/80">({impactosPositivos} positivo{impactosPositivos !== 1 ? 's' : ''})</span>
              )}
            </button>
          )}
        </div>
      )}

      <ReactFlowProvider>
        <FlowInner
          nodes={nodesDecorados}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onEdgeClick={handleEdgeClick}
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
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 mb-3 text-sm outline-none focus:border-blue-500"
              placeholder="Função / Cargo"
              value={novaFuncao}
              onChange={(e) => setNovaFuncao(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmarAdicao()}
            />
            <input
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 mb-3 text-sm outline-none focus:border-blue-500"
              placeholder="CPF (apenas números) — gera login automático"
              value={novoCpf}
              onChange={(e) => setNovoCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
              maxLength={11}
              inputMode="numeric"
            />
            {lidereAdicionar && obterSubordinados(colaboradoresState, adicionandoEm).length > 0 && (
              <label className="flex items-center gap-2 mb-4 text-xs text-zinc-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={transferirSubordinados}
                  onChange={(e) => setTransferirSubordinados(e.target.checked)}
                  className="rounded border-zinc-300 text-violet-600 focus:ring-violet-400"
                />
                Transferir {obterSubordinados(colaboradoresState, adicionandoEm).length} subordinado(s) atual(is) para {novoNome.trim() || "o novo gestor"}
              </label>
            )}
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

      {/* Modal de Impactos */}
      {mostrarImpactos && (
        <div
          className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center"
          onClick={() => setMostrarImpactos(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-6 w-[600px] max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                🔮 Impactos da Simulação
              </h3>
              <span className="text-xs text-zinc-400 bg-zinc-100 px-2 py-1 rounded-full">
                {totalImpactos} impacto{totalImpactos !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                {impactosPositivos} positivo{impactosPositivos !== 1 ? 's' : ''}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                {impactosNegativos} negativo{impactosNegativos !== 1 ? 's' : ''}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                {totalImpactos - impactosPositivos - impactosNegativos} neutro{totalImpactos - impactosPositivos - impactosNegativos !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {impactosSimulacao.length === 0 && (
                <p className="text-sm text-zinc-400 text-center py-8">
                  Nenhum impacto detectado ainda. Realize ações no organograma.
                </p>
              )}
              {impactosSimulacao.map((imp) => (
                <div
                  key={imp.id}
                  className={`p-3 rounded-lg border text-sm ${
                    imp.tipo === 'positivo'
                      ? 'bg-emerald-50 border-emerald-200'
                      : imp.tipo === 'negativo'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-zinc-50 border-zinc-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold uppercase ${
                          imp.tipo === 'positivo' ? 'text-emerald-600' : imp.tipo === 'negativo' ? 'text-red-600' : 'text-zinc-500'
                        }`}>
                          {imp.tipo}
                        </span>
                        <span className="font-medium text-zinc-800">{imp.titulo}</span>
                      </div>
                      <p className="text-xs text-zinc-600 mt-1">{imp.descricao}</p>
                      {imp.colaboradorNome && (
                        <span className="text-xs text-zinc-400 mt-1 block">
                          Colaborador: {imp.colaboradorNome}
                        </span>
                      )}
                    </div>
                    <span className={`text-lg ${
                      imp.tipo === 'positivo' ? 'text-emerald-500' : imp.tipo === 'negativo' ? 'text-red-500' : 'text-zinc-400'
                    }`}>
                      {imp.tipo === 'positivo' ? '✅' : imp.tipo === 'negativo' ? '⚠️' : '➡️'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Adicionar impacto manual */}
            <div className="border-t border-zinc-200 pt-3">
              <label className="text-xs text-zinc-500 mb-1 block">
                Adicionar observação de impacto manual:
              </label>
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-zinc-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="Descreva o impacto manual..."
                  value={impactoManual}
                  onChange={(e) => setImpactoManual(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdicionarImpactoManual()}
                />
                <button
                  onClick={handleAdicionarImpactoManual}
                  className="px-3 py-2 text-sm rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
                  disabled={!impactoManual.trim()}
                >
                  Adicionar
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setMostrarImpactos(false)}
                className="px-4 py-2 text-sm rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Preencher Vaga */}
      {preencherVaga && (
        <div
          className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center"
          onClick={() => setPreencherVaga(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-6 w-[500px] max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                ↑ Preencher vaga: {preencherVaga.cargoVagoFuncao}
              </h3>
              <button
                onClick={() => { setPreencherVaga(null); setBuscaCandidato('') }}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={buscaCandidato}
                onChange={(e) => setBuscaCandidato(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                autoFocus
              />
              {buscaCandidato && (
                <button
                  onClick={() => setBuscaCandidato('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  ✕
                </button>
              )}
            </div>

            <p className="text-sm text-zinc-500 mb-3">
              Selecione quem deve ocupar este cargo:
            </p>

            <div className="flex-1 overflow-y-auto space-y-2">
              {(() => {
                const filtrados = buscaCandidato
                  ? preencherVaga.candidatos.filter((c) =>
                      c.colaborador.nome.toLowerCase().includes(buscaCandidato.toLowerCase())
                    )
                  : preencherVaga.candidatos
                if (filtrados.length === 0) {
                  return (
                    <p className="text-sm text-zinc-400 text-center py-8">
                      {buscaCandidato ? 'Nenhum candidato encontrado.' : 'Nenhum candidato disponível.'}
                    </p>
                  )
                }
                return filtrados.map((cand) => (
                <div
                  key={cand.colaborador.id}
                  className="p-3 rounded-lg border border-zinc-200 hover:border-amber-300 hover:bg-amber-50/50 transition-colors cursor-pointer"
                  onClick={() => handleConfirmarPreencherVaga(cand.colaborador.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-zinc-800">{cand.colaborador.nome}</span>
                      <span className="text-xs text-zinc-500 ml-2">{cand.colaborador.funcao}</span>
                    </div>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                      Score: {cand.score.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-zinc-500">
                    <span>Avaliação: {cand.mediaAvaliacoes.toFixed(1)}</span>
                    <span>Perfil: {cand.perfil}</span>
                  </div>
                </div>
              ))})()}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => { setPreencherVaga(null); setBuscaCandidato('') }}
                className="px-4 py-2 text-sm rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Subordinados (4º nível+) */}
      {subordinadosModal && (
        <div
          className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center"
          onClick={() => { setSubordinadosModal(null); setBuscaCandidato('') }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-6 w-[500px] max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Subordinados de {subordinadosModal.colaborador.nome}
              </h3>
              <button
                onClick={() => { setSubordinadosModal(null); setBuscaCandidato('') }}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-zinc-500 mb-3">
              {subordinadosModal.subordinados.length} subordinado(s) — clique para promover via simulação:
            </p>

            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={buscaCandidato}
                onChange={(e) => setBuscaCandidato(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                autoFocus
              />
              {buscaCandidato && (
                <button
                  onClick={() => setBuscaCandidato('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {(() => {
                const filtrados = buscaCandidato
                  ? subordinadosModal.subordinados.filter((s) =>
                      s.colaborador.nome.toLowerCase().includes(buscaCandidato.toLowerCase())
                    )
                  : subordinadosModal.subordinados
                if (filtrados.length === 0) {
                  return (
                    <p className="text-sm text-zinc-400 text-center py-8">
                      {buscaCandidato ? 'Nenhum subordinado encontrado.' : 'Nenhum subordinado abaixo deste nível.'}
                    </p>
                  )
                }
                return filtrados.map((s) => (
                  <div
                    key={s.colaborador.id}
                    className="p-3 rounded-lg border border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSubordinadosModal(null)
                      setBuscaCandidato('')
                      // Abre o modal de preencher vaga (promoção via simulação)
                      handleSimularPromocao(s.colaborador.id)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-zinc-800">{s.colaborador.nome}</span>
                        <span className="text-xs text-zinc-500 ml-2">{s.colaborador.funcao}</span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Score: {s.score.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-zinc-500">
                      <span>Avaliação: {s.mediaAvaliacoes.toFixed(1)}</span>
                      <span>Perfil: {s.perfil}</span>
                    </div>
                  </div>
                ))
              })()}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => { setSubordinadosModal(null); setBuscaCandidato('') }}
                className="px-4 py-2 text-sm rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Relocar */}
      {relocarModal && (
        <div
          className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center"
          onClick={() => setRelocarModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-6 w-[480px] max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                ⟷ Relocar: {relocarModal.nome}
              </h3>
              <button
                onClick={() => setRelocarModal(null)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-zinc-500 mb-1">
              {relocarModal.funcaoAtual} — atualmente responde a{' '}
              <strong>{(() => {
                if (!relocarModal.liderAtualId) return 'ninguém (CEO)'
                const base = simulando ?? colaboradoresState
                const lider = base.find((c) => c.id === relocarModal.liderAtualId)
                return lider?.nome ?? 'desconhecido'
              })()}</strong>
            </p>

            <p className="text-sm text-zinc-500 mb-4">
              Escolha para quem {relocarModal.nome} deve passar a responder:
            </p>

            <div className="flex-1 overflow-y-auto space-y-1 mb-4">
              <div
                className="p-3 rounded-lg border-2 border-dashed border-zinc-300 hover:border-violet-400 hover:bg-violet-50/50 transition-colors cursor-pointer"
                onClick={() => handleConfirmarRelocar(null)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">👑</span>
                  <div>
                    <div className="font-medium text-zinc-800">Nenhum (CEO — topo da hierarquia)</div>
                    <div className="text-xs text-zinc-500">{relocarModal.nome} vira raiz do organograma</div>
                  </div>
                </div>
              </div>

              {(() => {
                const base = simulando ?? colaboradoresState
                const possiveis = base.filter(
                  (c) => c.id !== relocarModal.colaboradorId && c.status !== 'vago' && c.liderImediatoId !== relocarModal.colaboradorId
                )
                return possiveis.map((l) => {
                  const subCount = obterSubordinados(base, l.id).length
                  return (
                    <div
                      key={l.id}
                      className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                        l.id === relocarModal.liderAtualId
                          ? 'border-amber-300 bg-amber-50'
                          : 'border-zinc-200 hover:border-violet-300 hover:bg-violet-50/50'
                      }`}
                      onClick={() => handleConfirmarRelocar(l.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-zinc-800">{l.nome}</span>
                          <span className="text-xs text-zinc-500 ml-2">{l.funcao}</span>
                        </div>
                        {l.id === relocarModal.liderAtualId && (
                          <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                            ATUAL
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        {subCount > 0 ? `${subCount} subordinado(s)` : 'sem subordinados'}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setRelocarModal(null)}
                className="px-4 py-2 text-sm rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Contratar */}
      {contratarModal && (
        <div
          className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center"
          onClick={() => setContratarModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-6 w-[480px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                + Contratar: {contratarModal.cargoVagoFuncao}
              </h3>
              <button
                onClick={() => setContratarModal(null)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-zinc-500 mb-4">
              Preencha os dados da nova pessoa para ocupar este cargo.
            </p>

            <label className="text-xs text-zinc-500 mb-1 block">Nome</label>
            <input
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 mb-3 text-sm outline-none focus:border-emerald-500"
              placeholder="Nome do novo colaborador"
              value={contratarModal.nome}
              onChange={(e) => setContratarModal((prev) => prev ? { ...prev, nome: e.target.value } : null)}
              autoFocus
            />

            <label className="text-xs text-zinc-500 mb-1 block">Função / Cargo</label>
            <SelectCargo
              value={contratarModal.funcao}
              onChange={(val) => setContratarModal((prev) => prev ? { ...prev, funcao: val } : null)}
              placeholder="Ex: Diretor de Tecnologia"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setContratarModal(null)}
                className="px-4 py-2 text-sm rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarContratar}
                className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                disabled={!contratarModal.nome.trim() || !contratarModal.funcao.trim()}
              >
                + Contratar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Promoção Direta */}
      {promocaoModal && (
        <div
          className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center"
          onClick={() => setPromocaoModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-6 w-[480px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                ↑ Promover: {promocaoModal.nome}
              </h3>
              <button
                onClick={() => setPromocaoModal(null)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-zinc-500 mb-4">
              Escolha para quem {promocaoModal.nome} vai responder e qual cargo vai assumir.
            </p>

            <label className="text-xs text-zinc-500 mb-1 block">Novo Líder</label>
            <select
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 mb-3 text-sm outline-none focus:border-amber-500"
              value={promocaoModal.novoLiderId ?? ''}
              onChange={(e) => setPromocaoModal((prev) => prev ? { ...prev, novoLiderId: e.target.value || null } : null)}
            >
              <option value="">Nenhum (CEO)</option>
              {(simulando ?? colaboradoresState)
                .filter((c) => c.id !== promocaoModal.colaboradorId)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} — {c.funcao}
                  </option>
                ))}
            </select>

            <label className="text-xs text-zinc-500 mb-1 block">Novo Cargo</label>
            <SelectCargo
              value={promocaoModal.novoCargo}
              onChange={(val) => setPromocaoModal((prev) => prev ? { ...prev, novoCargo: val } : null)}
              placeholder="Ex: Diretor de Tecnologia"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setPromocaoModal(null); setBuscaCandidato('') }}
                className="px-4 py-2 text-sm rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarPromocaoDireta}
                className="px-4 py-2 text-sm rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50"
                disabled={promocaoModal.novoLiderId === undefined || !promocaoModal.novoCargo.trim()}
              >
                ↑ Promover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
