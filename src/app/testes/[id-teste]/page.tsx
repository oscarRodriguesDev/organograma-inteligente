import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { buscarTestePsicologico, obterRespostasTeste } from '@/lib/db'
import { ResponderTesteForm } from './responder-form'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DetalheTestePage({
  params,
}: {
  params: { 'id-teste': string }
}) {
  const session = await getSession()
  if (!session || !session.empresaId) {
    redirect('/login')
  }

  const testeId = params['id-teste']
  const teste = await buscarTestePsicologico(testeId)
  if (!teste || !teste.ativo) {
    notFound()
  }

  // Verifica se o teste está disponível para a empresa do colaborador
  const disponivelParaTodos = !teste.empresasDisponiveis || teste.empresasDisponiveis.length === 0
  const disponivelParaEmpresa = teste.empresasDisponiveis?.includes(session.empresaId)

  if (!disponivelParaTodos && !disponivelParaEmpresa) {
    redirect('/')
  }

  const respostasAnteriores = await obterRespostasTeste(teste.id, session.colaboradorId)

  return (
    <div className="flex-1 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <h1 className="text-2xl font-bold text-foreground">{teste.titulo}</h1>
          {teste.descricao && (
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">{teste.descricao}</p>
          )}
          {teste.instrucoes && (
            <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium text-foreground">Instruções:</span>{' '}
                {teste.instrucoes}
              </p>
            </div>
          )}
          <div className="flex items-center gap-4 mt-4 text-xs text-zinc-400 dark:text-zinc-500">
            <span>{teste.perguntas?.length ?? 0} perguntas</span>
            <span>Tipo: {teste.tipo}</span>
            <span>Criado por {teste.criadoPorNome}</span>
          </div>
        </div>

        {teste.perguntas && teste.perguntas.length > 0 ? (
          <ResponderTesteForm
            testeId={teste.id}
            perguntas={teste.perguntas.map(p => ({
              id: p.id,
              pergunta: p.pergunta,
              tipo: p.tipo,
              opcoes: p.opcoes,
              peso: p.peso,
              ordem: p.ordem,
              obrigatoria: p.obrigatoria,
            }))}
            respostasAnteriores={respostasAnteriores}
          />
        ) : (
          <div className="text-center py-12 text-zinc-400 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <p>Este teste não possui perguntas cadastradas.</p>
          </div>
        )}
      </div>
    </div>
  )
}
