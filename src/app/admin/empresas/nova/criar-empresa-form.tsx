'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { criarEmpresaAdminAction } from '@/lib/admin-actions'

export function CriarEmpresaAdminForm() {
  const router = useRouter()
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  function gerarSlug(nome: string): string {
    return nome
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  async function handleSubmit(formData: FormData) {
    setErro('')
    setSucesso('')
    const res = await criarEmpresaAdminAction(formData)
    if (res.ok) {
      setSucesso('Empresa criada com sucesso!')
      setTimeout(() => router.push('/admin/empresas'), 1500)
    } else {
      setErro(res.erro ?? 'Erro ao criar empresa')
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Dados da Empresa e CEO</h2>

      {sucesso && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm">
          {sucesso} Redirecionando...
        </div>
      )}

      <form action={handleSubmit} className="space-y-6">
        {/* Dados da Empresa */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">
            Empresa
          </h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="empresaNome" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Nome da Empresa *
              </label>
              <input
                type="text"
                id="empresaNome"
                name="empresaNome"
                required
                placeholder="Ex: Minha Empresa Ltda"
                onChange={(e) => {
                  const slugInput = document.getElementById('empresaSlug') as HTMLInputElement
                  if (slugInput && !slugInput.dataset.manual) {
                    slugInput.value = gerarSlug(e.target.value)
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
            <div>
              <label htmlFor="empresaSlug" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Slug (URL) *
              </label>
              <input
                type="text"
                id="empresaSlug"
                name="empresaSlug"
                required
                placeholder="minha-empresa"
                onChange={(e) => { e.target.dataset.manual = 'true' }}
                className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 font-mono"
              />
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                Slug único usado na URL da empresa. Pode ser editado manualmente.
              </p>
            </div>
          </div>
        </div>

        {/* Dados do CEO */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">
            CEO
          </h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="ceoNome" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Nome do CEO *
              </label>
              <input
                type="text"
                id="ceoNome"
                name="ceoNome"
                required
                placeholder="Nome completo do CEO"
                className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
            <div>
              <label htmlFor="ceoCpf" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                CPF do CEO *
              </label>
              <input
                type="text"
                id="ceoCpf"
                name="ceoCpf"
                required
                inputMode="numeric"
                maxLength={11}
                placeholder="Apenas números — gera login automático"
                className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                O email (cpf@slug.com) e a senha (6 primeiros dígitos) serão gerados automaticamente
              </p>
            </div>
          </div>
        </div>

        {erro && (
          <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm">
            {erro}
          </div>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2.5 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          Criar Empresa
        </button>
      </form>
    </div>
  )
}
