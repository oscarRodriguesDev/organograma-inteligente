import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { Papel } from '@/lib/types'
import { buscarEmpresa, listarColaboradoresEmpresaAction } from '@/lib/admin-actions'
import { AlternarStatusEmpresaButton } from '../alternar-status-button'
import { ExcluirEmpresaButton } from '../excluir-empresa-button'
import { RedefinirSenhaButton } from '../redefinir-senha-button'

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
  const session = await getSession()
  const empresa = await buscarEmpresa(id)
  const isAdmin = session?.papel === Papel.ADMIN_PLATAFORMA
  const isSuporte = session?.papel === Papel.ADMIN_SUPORTE
  const podeRedefinirSenha = isAdmin || isSuporte
  const colaboradores = podeRedefinirSenha ? await listarColaboradoresEmpresaAction(id) : []

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
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Colaboradores
              <span className="ml-2 text-sm font-normal text-zinc-500 dark:text-zinc-400">
                ({empresa.totalColaboradores} total)
              </span>
            </h2>
          </div>

          {colaboradores.length === 0 ? (
            <p className="text-sm text-zinc-400 dark:text-zinc-500 py-4 text-center">
              Nenhum colaborador encontrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    <th className="text-left px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400">Nome</th>
                    <th className="text-left px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400">Email</th>
                    <th className="text-left px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400">Função</th>
                    <th className="text-left px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400">Papel</th>
                    <th className="text-center px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400">Status</th>
                    {podeRedefinirSenha && (
                      <th className="text-right px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400">Ações</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {colaboradores.map((col) => (
                    <tr key={col.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-3 py-2.5 font-medium text-foreground">
                        <span>{col.nome}</span>
                        {col.username && (
                          <span className="ml-1.5 text-xs text-zinc-400">(@{col.username})</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-zinc-500 dark:text-zinc-400">
                        {col.email ?? '—'}
                      </td>
                      <td className="px-3 py-2.5 text-zinc-600 dark:text-zinc-400">
                        {col.funcao ?? '—'}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {col.papel}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                            col.status === 'ativo'
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                              : col.status === 'inativo'
                              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {col.status}
                        </span>
                      </td>
                      {podeRedefinirSenha && (
                        <td className="px-3 py-2.5 text-right">
                          <RedefinirSenhaButton
                            colaboradorId={col.id}
                            colaboradorNome={col.nome}
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {isAdmin && (
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
        )}
      </div>
    </div>
  )
}
