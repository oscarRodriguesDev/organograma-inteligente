'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { criarProjetoAction } from '../actions'

export default function NovoProjeto() {
  const [state, formAction, pending] = useActionState(criarProjetoAction, null)

  const hoje = new Date().toISOString().split('T')[0]

  return (
    <div className="flex-1 p-8">
      <div className="mx-auto max-w-lg">
        <Link
          href="/projetos"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Voltar
        </Link>

        <h1 className="mb-8 mt-4 text-2xl font-bold">Novo Projeto</h1>

        <form action={formAction} className="space-y-5">
          <div>
            <label htmlFor="nome" className="mb-1 block text-sm font-medium">
              Nome do Projeto <span className="text-red-500">*</span>
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              required
              maxLength={200}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Ex: Migração de servidor"
            />
          </div>

          <div>
            <label htmlFor="descricao" className="mb-1 block text-sm font-medium">
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              rows={4}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Descreva o objetivo e escopo do projeto..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dataInicio" className="mb-1 block text-sm font-medium">
                Data de Início
              </label>
              <input
                id="dataInicio"
                name="dataInicio"
                type="date"
                defaultValue={hoje}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="dataFim" className="mb-1 block text-sm font-medium">
                Data de Término
              </label>
              <input
                id="dataFim"
                name="dataFim"
                type="date"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          {state && typeof state === 'object' && 'error' in state && (
            <p className="text-sm text-red-600">{state.error as string}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {pending ? 'Salvando...' : 'Criar Projeto'}
          </button>
        </form>
      </div>
    </div>
  )
}
