import { notFound } from 'next/navigation'
import { buscarAtribuicaoPorToken } from '@/lib/db'
import { ResponderTesteTokenForm } from './form'

export const dynamic = 'force-dynamic'

export default async function ResponderTestePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const result = await buscarAtribuicaoPorToken(token)

  if (!result.valida) {
    if (result.expirada) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
          <div className="max-w-md w-full text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-10 shadow-sm">
            <p className="text-5xl mb-4">🔒</p>
            <h1 className="text-xl font-bold text-foreground mb-2">Teste já respondido</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Este link já foi utilizado. Cada link só pode ser usado uma vez.
              Se precisar refazer o teste, solicite um novo link ao seu gestor.
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-md w-full text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-10 shadow-sm">
          <p className="text-5xl mb-4">❌</p>
          <h1 className="text-xl font-bold text-foreground mb-2">Link inválido</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Este link de teste não é válido. Verifique o link ou solicite um novo ao seu gestor.
          </p>
        </div>
      </div>
    )
  }

  const { atribuicao } = result
  if (!atribuicao) return notFound()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-2xl font-bold mx-auto mb-4">
            OG
          </div>
          <h1 className="text-2xl font-bold text-foreground">{atribuicao.testeTitulo}</h1>
          {atribuicao.testeDescricao && (
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">{atribuicao.testeDescricao}</p>
          )}
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
            Colaborador: <span className="font-medium text-foreground">{atribuicao.colaboradorNome}</span>
          </p>
        </div>

        {/* Instruções */}
        {atribuicao.testeInstrucoes && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <span className="font-semibold">📋 Instruções:</span>{' '}
              {atribuicao.testeInstrucoes}
            </p>
          </div>
        )}

        {/* Formulário */}
        <ResponderTesteTokenForm
          token={token}
          perguntas={atribuicao.perguntas}
        />
      </div>
    </div>
  )
}
