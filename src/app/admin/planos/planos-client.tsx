'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import {
  criarPlanoAction,
  atualizarPlanoAction,
  excluirPlanoAction,
  alternarStatusPlanoAction,
  alternarDestaquePlanoAction,
} from '@/lib/admin-planos-actions'

// ─── Types ──────────────────────────────────────────────────

interface PlanoAdmin {
  id: string
  nome: string
  slug: string
  descricao: string
  precoMensal: number
  precoAnual: number
  maxColaboradores: number
  recursos: string[]
  destaque: boolean
  ativo: boolean
  ordem: number
  descontoPercentual: number
  promocaoAtiva: boolean
  promocaoValidade: string | null
  promocaoDescricao: string
  totalAssinaturas: number
  createdAt: string
}

// ─── Helpers ────────────────────────────────────────────────

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarData(data: string | null): string {
  if (!data) return '—'
  return new Date(data).toLocaleDateString('pt-BR')
}

// ─── Submit Button ──────────────────────────────────────────

function SubmitButton({ label = 'Salvar' }: { label?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Salvando...' : label}
    </button>
  )
}

// ─── Modal Base ─────────────────────────────────────────────

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Form Fields (reusable) ─────────────────────────────────

function PlanoFormFields({
  plano,
}: {
  plano?: {
    nome?: string
    slug?: string
    descricao?: string
    precoMensal?: number
    precoAnual?: number
    maxColaboradores?: number
    recursos?: string
    destaque?: boolean
    ativo?: boolean
    ordem?: number
    descontoPercentual?: number
    promocaoAtiva?: boolean
    promocaoValidade?: string
    promocaoDescricao?: string
  }
}) {
  const recursosText = Array.isArray(plano?.recursos)
    ? (plano?.recursos as unknown as string[]).join('\n')
    : (plano?.recursos as string) ?? ''

  return (
    <div className="space-y-4">
      {/* Nome e Slug */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Nome do Plano *
          </label>
          <input
            type="text"
            name="nome"
            required
            defaultValue={plano?.nome ?? ''}
            placeholder="Ex: Profissional"
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Slug (URL)
          </label>
          <input
            type="text"
            name="slug"
            defaultValue={plano?.slug ?? ''}
            placeholder="Auto-preenchido se vazio"
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 font-mono"
          />
        </div>
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
          Descrição
        </label>
        <textarea
          name="descricao"
          rows={2}
          defaultValue={plano?.descricao ?? ''}
          placeholder="Breve descrição do plano"
          className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none"
        />
      </div>

      {/* Preços */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Preço Mensal (R$) *
          </label>
          <input
            type="number"
            name="precoMensal"
            required
            step="0.01"
            min="0"
            defaultValue={plano?.precoMensal ?? 49.9}
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Preço Anual (R$) *
          </label>
          <input
            type="number"
            name="precoAnual"
            required
            step="0.01"
            min="0"
            defaultValue={plano?.precoAnual ?? 499}
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
      </div>

      {/* Máx Colaboradores e Ordem */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Máx. Colaboradores (-1 = ilimitado)
          </label>
          <input
            type="number"
            name="maxColaboradores"
            min="-1"
            defaultValue={plano?.maxColaboradores ?? 10}
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Ordem de Exibição
          </label>
          <input
            type="number"
            name="ordem"
            min="0"
            defaultValue={plano?.ordem ?? 0}
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
      </div>

      {/* Recursos */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
          Recursos (um por linha)
        </label>
        <textarea
          name="recursos"
          rows={4}
          defaultValue={recursosText}
          placeholder="Organograma interativo&#10;Até 50 colaboradores&#10;IA generativa"
          className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="destaque"
            defaultChecked={plano?.destaque ?? false}
            className="rounded border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:ring-zinc-400"
          />
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Plano em destaque</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="ativo"
            defaultChecked={plano?.ativo ?? true}
            className="rounded border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:ring-zinc-400"
          />
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Plano ativo</span>
        </label>
      </div>

      {/* ─── Promoção ─────────────────────────────────────── */}
      <hr className="border-zinc-200 dark:border-zinc-800" />
      <h4 className="text-sm font-semibold text-foreground">Promoção / Desconto</h4>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Desconto Percentual (%)
          </label>
          <input
            type="number"
            name="descontoPercentual"
            min="0"
            max="100"
            step="0.1"
            defaultValue={plano?.descontoPercentual ?? 0}
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Validade da Promoção
          </label>
          <input
            type="date"
            name="promocaoValidade"
            defaultValue={
              plano?.promocaoValidade
                ? new Date(plano.promocaoValidade).toISOString().split('T')[0]
                : ''
            }
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
          Descrição da Promoção
        </label>
        <input
          type="text"
          name="promocaoDescricao"
          defaultValue={plano?.promocaoDescricao ?? ''}
          placeholder="Ex: Lançamento - 30% OFF no primeiro mês"
          className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="promocaoAtiva"
          defaultChecked={plano?.promocaoAtiva ?? false}
          className="rounded border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:ring-zinc-400"
        />
        <span className="text-sm text-zinc-600 dark:text-zinc-400">Promoção ativa</span>
      </label>
    </div>
  )
}

// ─── Card do Plano ──────────────────────────────────────────

function PlanoCard({
  plano,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleDestaque,
}: {
  plano: PlanoAdmin
  onEdit: (p: PlanoAdmin) => void
  onDelete: (p: PlanoAdmin) => void
  onToggleActive: (p: PlanoAdmin) => void
  onToggleDestaque: (p: PlanoAdmin) => void
}) {
  const precoComDesconto =
    plano.descontoPercentual > 0 && plano.promocaoAtiva
      ? plano.precoMensal * (1 - plano.descontoPercentual / 100)
      : null

  return (
    <div
      className={`rounded-xl border p-5 transition-colors ${
        plano.ativo
          ? 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'
          : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 opacity-70'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-foreground">{plano.nome}</h3>
            {plano.destaque && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                Destaque
              </span>
            )}
            {!plano.ativo && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 font-medium">
                Inativo
              </span>
            )}
            {plano.promocaoAtiva && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
                Promoção
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">{plano.descricao}</p>

          <div className="flex items-center gap-3 mt-2">
            <span className="text-lg font-bold text-foreground">
              {formatarMoeda(plano.precoMensal)}
              <span className="text-xs font-normal text-zinc-400">/mês</span>
            </span>
            {precoComDesconto && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 font-medium">
                {formatarMoeda(precoComDesconto)} com {plano.descontoPercentual}% OFF
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400">
            <span>Anual: {formatarMoeda(plano.precoAnual)}</span>
            <span>•</span>
            <span>
              Colaboradores:{' '}
              {plano.maxColaboradores === -1 ? '∞' : plano.maxColaboradores}
            </span>
            <span>•</span>
            <span>{plano.totalAssinaturas} assinatura(s)</span>
            <span>•</span>
            <span>Ordem: {plano.ordem}</span>
          </div>

          {plano.promocaoAtiva && (
            <div className="mt-2 text-xs text-green-600 dark:text-green-400">
              {plano.promocaoDescricao || `Desconto de ${plano.descontoPercentual}%`}
              {plano.promocaoValidade && ` — válido até ${formatarData(plano.promocaoValidade)}`}
            </div>
          )}

          {/* Recursos Preview */}
          {plano.recursos.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {plano.recursos.slice(0, 3).map((r, i) => (
                <span
                  key={i}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                >
                  {r}
                </span>
              ))}
              {plano.recursos.length > 3 && (
                <span className="text-[10px] px-1.5 py-0.5 text-zinc-400">
                  +{plano.recursos.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            onClick={() => onToggleActive(plano)}
            className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
              plano.ativo
                ? 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                : 'border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
            }`}
          >
            {plano.ativo ? 'Desativar' : 'Ativar'}
          </button>
          <button
            onClick={() => onToggleDestaque(plano)}
            className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
              plano.destaque
                ? 'border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            {plano.destaque ? 'Remover Destaque' : 'Destacar'}
          </button>
          <button
            onClick={() => onEdit(plano)}
            className="text-xs px-2.5 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(plano)}
            className="text-xs px-2.5 py-1.5 rounded-md border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Componente Principal ───────────────────────────────────

export function AdminPlanosClient({ planos }: { planos: PlanoAdmin[] }) {
  const [editPlano, setEditPlano] = useState<PlanoAdmin | null>(null)
  const [deletePlano, setDeletePlano] = useState<PlanoAdmin | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  async function handleCreate(formData: FormData) {
    setErro('')
    setSucesso('')
    const result = await criarPlanoAction(formData)
    if (!result.ok) {
      setErro(result.erro ?? 'Erro ao criar plano')
    } else {
      setSucesso('Plano criado com sucesso!')
      setShowCreate(false)
    }
  }

  async function handleEdit(planoId: string, formData: FormData) {
    setErro('')
    setSucesso('')
    const result = await atualizarPlanoAction(planoId, formData)
    if (!result.ok) {
      setErro(result.erro ?? 'Erro ao atualizar plano')
    } else {
      setSucesso('Plano atualizado com sucesso!')
      setEditPlano(null)
    }
  }

  async function handleDelete(planoId: string) {
    setErro('')
    setSucesso('')
    const result = await excluirPlanoAction(planoId)
    if (!result.ok) {
      setErro(result.erro ?? 'Erro ao excluir plano')
    } else {
      setSucesso('Plano excluído com sucesso!')
      setDeletePlano(null)
    }
  }

  async function handleToggleActive(plano: PlanoAdmin) {
    setErro('')
    setSucesso('')
    await alternarStatusPlanoAction(plano.id, !plano.ativo)
    setSucesso(`Plano "${plano.nome}" ${plano.ativo ? 'desativado' : 'ativado'}!`)
  }

  async function handleToggleDestaque(plano: PlanoAdmin) {
    setErro('')
    setSucesso('')
    await alternarDestaquePlanoAction(plano.id, !plano.destaque)
    setSucesso(`Plano "${plano.nome}" ${plano.destaque ? 'removido do' : 'marcado como'} destaque!`)
  }

  return (
    <div>
      {/* Feedback Messages */}
      {erro && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {erro}
        </div>
      )}
      {sucesso && (
        <div className="mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          {sucesso}
        </div>
      )}

      {/* Botão Novo Plano */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 text-sm font-medium rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          + Novo Plano
        </button>
      </div>

      {/* Lista de Planos */}
      {planos.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-lg">Nenhum plano cadastrado.</p>
          <p className="text-sm mt-1">Clique em &ldquo;Novo Plano&rdquo; para criar o primeiro.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {planos.map((plano) => (
            <PlanoCard
              key={plano.id}
              plano={plano}
              onEdit={(p) => setEditPlano(p)}
              onDelete={(p) => setDeletePlano(p)}
              onToggleActive={handleToggleActive}
              onToggleDestaque={handleToggleDestaque}
            />
          ))}
        </div>
      )}

      {/* ─── Modal: Criar Plano ──────────────────────────────── */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Novo Plano">
        <form action={handleCreate} className="space-y-4">
          <PlanoFormFields />
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <SubmitButton label="Criar Plano" />
          </div>
        </form>
      </Modal>

      {/* ─── Modal: Editar Plano ─────────────────────────────── */}
      <Modal
        open={!!editPlano}
        onClose={() => setEditPlano(null)}
        title={`Editar: ${editPlano?.nome ?? ''}`}
      >
        {editPlano && (
          <form
            action={async (formData) => {
              await handleEdit(editPlano.id, formData)
            }}
            className="space-y-4"
          >
            <PlanoFormFields
              plano={{
                nome: editPlano.nome,
                slug: editPlano.slug,
                descricao: editPlano.descricao,
                precoMensal: editPlano.precoMensal,
                precoAnual: editPlano.precoAnual,
                maxColaboradores: editPlano.maxColaboradores,
                recursos: editPlano.recursos.join('\n'),
                destaque: editPlano.destaque,
                ativo: editPlano.ativo,
                ordem: editPlano.ordem,
                descontoPercentual: editPlano.descontoPercentual,
                promocaoAtiva: editPlano.promocaoAtiva,
                promocaoValidade: editPlano.promocaoValidade ?? '',
                promocaoDescricao: editPlano.promocaoDescricao,
              }}
            />
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setEditPlano(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <SubmitButton label="Salvar Alterações" />
            </div>
          </form>
        )}
      </Modal>

      {/* ─── Modal: Confirmar Exclusão ───────────────────────── */}
      <Modal
        open={!!deletePlano}
        onClose={() => setDeletePlano(null)}
        title="Excluir Plano"
      >
        {deletePlano && (
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Tem certeza que deseja excluir o plano <strong>{deletePlano.nome}</strong>?
              {deletePlano.totalAssinaturas > 0 && (
                <span className="block mt-2 text-amber-600 dark:text-amber-400">
                  ⚠️ Este plano possui {deletePlano.totalAssinaturas} assinatura(s). 
                  {deletePlano.totalAssinaturas > 0 && ' Apenas assinaturas canceladas serão removidas.'}
                </span>
              )}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletePlano(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <form
                action={async () => {
                  await handleDelete(deletePlano.id)
                }}
              >
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sim, excluir
                </button>
              </form>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
