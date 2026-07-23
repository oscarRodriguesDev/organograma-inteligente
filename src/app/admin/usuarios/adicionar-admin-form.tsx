'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { criarAdminAction } from '@/lib/admin-actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2.5 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Criando...' : 'Adicionar Admin'}
    </button>
  )
}

export function AdicionarAdminForm() {
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  async function handleSubmit(formData: FormData) {
    setErro('')
    setSucesso('')
    const res = await criarAdminAction(formData)
    if (res.ok) {
      setSucesso('Admin criado com sucesso!')
    } else {
      setErro(res.erro ?? 'Erro ao criar admin')
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Novo Administrador</h2>

      {sucesso && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs">
          {sucesso}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nome" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Nome *
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            required
            placeholder="Nome do admin"
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="email@admin.com"
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>

        <div>
          <label htmlFor="papel" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Nível de Acesso *
          </label>
          <select
            id="papel"
            name="papel"
            required
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
          >
            <option value="ADMIN_PLATAFORMA">Admin Sistema (acesso total)</option>
            <option value="ADMIN_SUPORTE">Admin Suporte (empresas + perfil)</option>
            <option value="ADMIN_PSICH">Admin Psicólogo (testes psicológicos)</option>
          </select>
        </div>

        <div>
          <label htmlFor="senha" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Senha *
          </label>
          <input
            type="password"
            id="senha"
            name="senha"
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>

        {erro && <p className="text-sm text-red-500">{erro}</p>}

        <SubmitButton />
      </form>
    </div>
  )
}
