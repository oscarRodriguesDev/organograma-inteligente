import { notFound } from 'next/navigation'
import Link from 'next/link'
import { buscarEmpresa } from '@/lib/admin-actions'
import { AlternarStatusEmpresaButton } from '../alternar-status-button'
import { ExcluirEmpresaButton } from '../excluir-empresa-button'

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function AdminEmpresaDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const empresa = await buscarEmpresa(id)

  if (!empresa) {
    notFound()
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/admin/empresas"
          className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          ← Voltar para empresas
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-foreground">{empresa.nome}</h1>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full ${
              empresa.ativa
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
            }`}
          >
            {empresa.ativa ? 'Ativa' : 'Inativa'}
          </span>
        </div>
        <p className="text-zinc-500 dark:text-zinc-400">{empresa.slug}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Informações</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-zinc-500 dark:text-zinc-400">Nome</dt>
              <dd className="text-sm font-medium text-foreground">{empresa.nome}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-zinc-500 dark:text-zinc-400">Slug</dt>
              <dd className="text-sm font-mono text-foreground">{empresa.slug}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-zinc-500 dark:text-zinc-400">CNPJ</dt>
              <dd className="text-sm font-medium text-foreground">{empresa.cnpj || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-zinc-500 dark:text-zinc-400">Contato</dt>
              <dd className="text-sm font-medium text-foreground">{empresa.contatoNome || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-zinc-500 dark:text-zinc-400">E-mail</dt>
              <dd className="text-sm text-foreground">{empresa.contatoEmail || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-zinc-500 dark:text-zinc-400">Telefone</dt>
              <dd className="text-sm font-medium text-foreground">{empresa.contatoTelefone || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-zinc-500 dark:text-zinc-400">Data de Contratação</dt>
              <dd className="text-sm font-medium text-foreground">{formatarData(empresa.dataContratacao)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-zinc-500 dark:text-zinc-400">Cadastrada em</dt>
              <dd className="text-sm font-medium text-foreground">{formatarData(empresa.createdAt)}</dd>
            </div>
          </dl>
        </div>

        {/* Plano e Assinatura */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Plano e Assinatura</h2>
          {empresa.assinatura ? (
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-zinc-500 dark:text-zinc-400">Plano</dt>
                <dd className="text-sm font-medium text-foreground">{empresa.assinatura.plano?.nome ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-zinc-500 dark:text-zinc-400">Valor Mensal</dt>
                <dd className="text-sm font-medium text-foreground">
                  {empresa.assinatura.plano?.precoMensal ? formatarMoeda(empresa.assinatura.plano.precoMensal) : '—'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-zinc-500 dark:text-zinc-400">Ciclo</dt>
                <dd className="text-sm font-medium text-foreground capitalize">{empresa.assinatura.ciclo}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-zinc-500 dark:text-zinc-400">Status</dt>
                <dd className="text-sm font-medium">
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                      empresa.assinatura.status === 'ativa'
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {empresa.assinatura.status}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-zinc-500 dark:text-zinc-400">Início</dt>
                <dd className="text-sm font-medium text-foreground">{formatarData(empresa.assinatura.dataInicio)}</dd>
              </div>
              {empresa.assinatura.dataProximoPagamento && (
                <div className="flex justify-between">
                  <dt className="text-sm text-zinc-500 dark:text-zinc-400">Próx. Pagamento</dt>
                  <dd className="text-sm font-medium text-foreground">{formatarData(empresa.assinatura.dataProximoPagamento)}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-sm text-zinc-400 dark:text-zinc-500">Nenhuma assinatura ativa.</p>
          )}
        </div>

        {/* Colaboradores */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Colaboradores</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{empresa.totalColaboradores}</span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">total</span>
          </div>
        </div>

        {/* Ações */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Ações</h2>
          <div className="flex flex-wrap gap-3">
            <AlternarStatusEmpresaButton
              empresaId={empresa.id}
              ativa={empresa.ativa}
            />
            <ExcluirEmpresaButton
              empresaId={empresa.id}
              empresaNome={empresa.nome}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
