import { getSession } from '@/lib/auth'
import { Papel } from '@/lib/types'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { buscarTestePsicologico, listarColaboradoresParaAtribuicao } from '@/lib/db'
import { AtribuirTesteForm } from './form'

export const dynamic = 'force-dynamic'

export default async function AtribuirTestePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()
  if (!session || !session.empresaId) redirect('/login')

  const papeisPermitidos = [Papel.GESTOR, Papel.SUPERVISOR, Papel.GERENTE, Papel.DIRETOR, Papel.CEO, Papel.RH, Papel.ADMIN_PLATAFORMA, Papel.ADMIN_SUPORTE]
  if (!papeisPermitidos.includes(session.papel as Papel)) {
    redirect('/')
  }

  const teste = await buscarTestePsicologico(id)
  if (!teste || !teste.ativo) {
    notFound()
  }

  const colaboradores = await listarColaboradoresParaAtribuicao(session.empresaId)

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          <a href="/gestao/testes" className="hover:text-foreground transition-colors">
            Gestão de Testes
          </a>
          <span>/</span>
          <span className="text-foreground font-medium">Atribuir Teste</span>
        </div>

        {/* Teste Info */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl shrink-0">
              📝
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-foreground">{teste.titulo}</h1>
              {teste.descricao && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{teste.descricao}</p>
              )}
              {teste.instrucoes && (
                <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium text-foreground">Instruções do teste:</span>{' '}
                    {teste.instrucoes}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-zinc-400 dark:text-zinc-500">
                <span>{teste.perguntas?.length ?? 0} perguntas</span>
                <span>Tipo: {teste.tipo}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seleção de Colaboradores */}
        <AtribuirTesteForm
          testeId={teste.id}
          testeTitulo={teste.titulo}
          colaboradores={colaboradores}
        />
      </div>
    </div>
  )
}
