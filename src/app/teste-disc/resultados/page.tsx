import Link from 'next/link'
import { listarResultadosDISC } from '@/lib/db'

const CORES_BARRA: Record<string, { bg: string; label: string }> = {
  D: { bg: 'bg-red-500', label: 'Dominância (D)' },
  I: { bg: 'bg-yellow-500', label: 'Influência (I)' },
  S: { bg: 'bg-green-500', label: 'Estabilidade (S)' },
  C: { bg: 'bg-blue-500', label: 'Conformidade (C)' },
}

function calcularPerfilExtenso(perfil: string): string {
  const mapa: Record<string, string> = {
    D: 'Dominante', I: 'Influente', S: 'Estável', C: 'Conforme',
  }
  return perfil.split('').map((l) => mapa[l] || l).join(' + ')
}

export default async function ResultadosDISC() {
  const resultados = await listarResultadosDISC()

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Resultados DISC</h1>
          <Link href="/teste-disc"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
            Novo Teste
          </Link>
        </div>

        {resultados.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center">
            <p className="text-zinc-500">Nenhum resultado disponível.</p>
            <Link href="/teste-disc" className="mt-2 inline-block text-sm font-medium text-black underline">
              Fazer primeiro teste
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {resultados.map((r) => (
              <div key={r.id} className="rounded-lg border border-zinc-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-zinc-800">{r.colaboradorNome}</p>
                    <p className="text-xs text-zinc-400">
                      {new Date(r.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className="rounded-full bg-zinc-900 px-3 py-1 text-sm font-bold text-white">
                    {r.perfil}
                  </span>
                </div>

                <p className="text-sm text-zinc-600 mb-4">
                  Perfil: <strong>{calcularPerfilExtenso(r.perfil)}</strong>
                </p>

                <div className="space-y-3">
                  {(['D', 'I', 'S', 'C'] as const).map((dim) => {
                    const pontuacao = r[`pontuacao${dim}` as keyof typeof r] as number
                    const cor = CORES_BARRA[dim]
                    return (
                      <div key={dim}>
                        <div className="flex justify-between text-xs text-zinc-500 mb-1">
                          <span>{cor.label}</span>
                          <span>{pontuacao}/10</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-zinc-100">
                          <div
                            className={`h-3 rounded-full ${cor.bg} transition-all`}
                            style={{ width: `${Math.min(pontuacao * 10, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
