import Link from 'next/link'
import { listarResultadosDISC } from '@/lib/db'

const COR_DIMENSAO: Record<string, string> = {
  D: 'bg-red-500',
  I: 'bg-yellow-500',
  S: 'bg-green-500',
  C: 'bg-blue-500',
}

const DESCRICAO_PERFIL: Record<string, string> = {
  D: 'Dominância — Foco em resultados, desafios e decisões rápidas.',
  I: 'Influência — Comunicação, entusiasmo e construção de relacionamentos.',
  S: 'Estabilidade — Paciência, consistência e trabalho em equipe.',
  C: 'Conformidade — Precisão, análise e cumprimento de regras.',
}

function gerarDescricaoPerfil(perfil: string): string {
  const descricoes = perfil.split('').map((letra) => DESCRICAO_PERFIL[letra]).filter(Boolean)
  return descricoes.length > 0 ? descricoes.join(' ') : 'Perfil não definido.'
}

export default async function ResultadosDISCPage() {
  const resultados = await listarResultadosDISC()

  return (
    <div className="flex-1 p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/teste-disc"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Voltar para Teste DISC
        </Link>

        <div className="mt-4 mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Resultados DISC</h1>
          <Link
            href="/teste-disc"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Fazer Novo Teste
          </Link>
        </div>

        {resultados.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center">
            <p className="text-zinc-500">Nenhum resultado DISC registrado.</p>
            <Link
              href="/teste-disc"
              className="mt-2 inline-block text-sm font-medium text-black underline"
            >
              Fazer primeiro teste
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {resultados.map((r) => {
              const maxPontuacao = Math.max(r.pontuacaoD, r.pontuacaoI, r.pontuacaoS, r.pontuacaoC, 1)
              const dimensoes = [
                { sigla: 'D', valor: r.pontuacaoD },
                { sigla: 'I', valor: r.pontuacaoI },
                { sigla: 'S', valor: r.pontuacaoS },
                { sigla: 'C', valor: r.pontuacaoC },
              ] as const

              return (
                <div key={r.id} className="rounded-lg border border-zinc-200 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold">{r.colaboradorNome}</h2>
                      <p className="text-xs text-zinc-400">
                        {new Date(r.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className="rounded-full bg-zinc-900 px-3 py-1 text-sm font-bold text-white">
                      {r.perfil}
                    </span>
                  </div>

                  <p className="mb-4 text-sm text-zinc-600">
                    {gerarDescricaoPerfil(r.perfil)}
                  </p>

                  {/* Gráfico de barras simplificado */}
                  <div className="space-y-2">
                    {dimensoes.map(({ sigla, valor }) => (
                      <div key={sigla} className="flex items-center gap-3">
                        <span className="w-4 text-center text-sm font-bold text-zinc-600">{sigla}</span>
                        <div className="flex-1">
                          <div className="h-5 w-full rounded-full bg-zinc-100">
                            <div
                              className={`h-5 rounded-full ${COR_DIMENSAO[sigla]} transition-all`}
                              style={{ width: `${Math.round((valor / 100) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className="w-8 text-right text-xs font-medium text-zinc-500">{valor}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
