'use client'

import { useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  Handle,
  Position,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { Colaborador } from '@/lib/types'

function OrganogramaNode({ data }: { data: { colaborador: Colaborador } }) {
  const { colaborador } = data
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-sm min-w-[160px]">
      <Handle type="target" position={Position.Top} className="!border-zinc-300" />
      <div className="text-sm font-semibold text-zinc-900">{colaborador.nome}</div>
      <div className="text-xs text-zinc-500 mt-0.5">{colaborador.funcao}</div>
      <Handle type="source" position={Position.Bottom} className="!border-zinc-300" />
    </div>
  )
}

const nodeTypes = { colaborador: OrganogramaNode }

function layoutArvore(colaboradores: Colaborador[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  const raizes = colaboradores.filter((c) => !c.liderImediatoId)
  const mapa = new Map(colaboradores.map((c) => [c.id, c]))

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

  const NIVEL_H = 160
  const NODE_W = 180
  const LARGURA_POR_NIVEL: number[] = []
  for (const [nivel, cols] of niveis) {
    LARGURA_POR_NIVEL[nivel] = (LARGURA_POR_NIVEL[nivel - 1] || 0) + cols.length * (NODE_W + 40)
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

export default function OrganogramaFlow({
  colaboradores,
}: {
  colaboradores: Colaborador[]
}) {
  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(
    () => layoutArvore(colaboradores),
    [colaboradores]
  )

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 57px)' }}>
      <ReactFlow
        nodes={layoutNodes}
        edges={layoutEdges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.3}
        maxZoom={2}
        panOnDrag
        zoomOnScroll
        selectNodesOnDrag={false}
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
    </div>
  )
}
