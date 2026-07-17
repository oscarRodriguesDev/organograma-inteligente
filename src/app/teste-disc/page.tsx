import Link from 'next/link'
import { listarPerguntasDISC } from '@/lib/db'
import { listarColaboradores } from '@/lib/db'
import { responderDISCAction } from './actions'

const CORES_DIMENSAO: Record<string, { nome: string; cor: string; bg: string; border: string }> = {
  D: { nome: 'Dominância', cor: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
  I: { nome: 'Influência', cor: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  S: { nome: 'Estabilidade', cor: 'text-green-700', bg: 'bg-green-50', border: 'border-green-300' },
  C: { nome: 'Conformidade', cor: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
}

export default async function TesteDISC() {
  const [perguntas, colaboradores] = await Promise.all([
    listarPerguntasDISC(),
    listarColaboradores(),
  ])

  const agrupadas = perguntas.reduce((acc, p) => {
    if (!acc[p.dimensao]) acc[p.dimensao] = []
    acc[p.dimensao].push(p)
    return acc
  }, {} as Record<string, typeof perguntas>)

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">← Voltar</Link>
        <h1 className="mt-4 mb-2 text-2xl font-bold">Teste DISC</h1>
        <p className="text-sm text-zinc-500 mb-8">
          Avalie seu perfil comportamental respondendo cada pergunta de 1 (discordo totalmente) a 5 (concordo totalmente).
        </p>

        <form action={responderDISCAction} className="space-y-8">
          <div>
            <label htmlFor="colaboradorId" className="mb-1 block text-sm font-medium">Colaborador</label>
            <select id="colaboradorId" name="colaboradorId" required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none">
              <option value="">Selecione</option>
              {colaboradores.map((c) => (
                <option key={c.id} value={c.id}>{c.nome} — {c.funcao}</option>
              ))}
            </select>
          </div>

          {Object.entries(agrupadas).map(([dimensao, pergs]) => {
            const c = CORES_DIMENSAO[dimensao]
            return (
              <div key={dimensao} className={`rounded-lg border ${c.border} ${c.bg} p-5`}>
                <h2 className={`text-lg font-bold ${c.cor} mb-1`}>
                  {dimensao} — {c.nome}
                </h2>
                <div className="space-y-4 mt-4">
                  {pergs.map((p, i) => (
                    <div key={p.id}>
                      <p className="text-sm font-medium mb-2">{i + 1}. {p.pergunta}</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((nota) => (
                          <label key={nota} className="flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-lg border border-zinc-200 bg-white p-2 text-xs has-[:checked]:border-black has-[:checked]:bg-zinc-50">
                            <input type="radio" name={`nota_${p.id}`} value={nota} defaultChecked={nota === 3} className="sr-only" />
                            <span className="text-sm font-semibold">{nota}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          <button type="submit" className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
            Enviar Respostas
          </button>
        </form>
      </div>
    </div>
  )
}
