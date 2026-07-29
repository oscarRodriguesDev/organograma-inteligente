'use client'

import { criarContaAction } from '@/lib/public-actions'

export function OnboardingForm({
  sessionToken,
}: {
  sessionToken: string
}) {
  function autoPreencherSlug(e: React.ChangeEvent<HTMLInputElement>) {
    const slugInput = document.getElementById('slug') as HTMLInputElement
    if (slugInput && !slugInput.dataset.userEdited) {
      slugInput.value = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }
  }

  function marcarEditado(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.dataset.userEdited = 'true'
  }

  return (
    <div className="flex-1 flex items-start justify-center p-8 pt-12">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-2">Criar Conta</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-8">
          Cadastre sua empresa e defina o administrador principal
        </p>

        <form action={criarContaAction} className="space-y-6">
          {/* Dados da Empresa */}
          <fieldset>
            <legend className="text-sm font-semibold mb-3">Dados da Empresa</legend>
            <div className="space-y-4">
              <div>
                <label htmlFor="nome" className="mb-1 block text-sm font-medium">
                  Nome da Empresa <span className="text-red-500">*</span>
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  required
                  autoFocus
                  onChange={autoPreencherSlug}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-transparent focus:border-zinc-500 focus:outline-none"
                  placeholder="Minha Empresa Ltda"
                />
              </div>

              <div>
                <label htmlFor="slug" className="mb-1 block text-sm font-medium">
                  Slug (URL amigável) <span className="text-red-500">*</span>
                </label>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  required
                  onFocus={marcarEditado}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-transparent focus:border-zinc-500 focus:outline-none font-mono"
                  placeholder="minha-empresa"
                />
                <p className="mt-1 text-xs text-zinc-400">
                  URL amigável para acesso da sua empresa
                </p>
              </div>

              <div>
                <label htmlFor="cnpj" className="mb-1 block text-sm font-medium">
                  CNPJ
                </label>
                <input
                  id="cnpj"
                  name="cnpj"
                  type="text"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-transparent focus:border-zinc-500 focus:outline-none"
                  placeholder="00.000.000/0000-00 (opcional)"
                />
              </div>

              <div>
                <label htmlFor="contatoNome" className="mb-1 block text-sm font-medium">
                  Nome do Contato
                </label>
                <input
                  id="contatoNome"
                  name="contatoNome"
                  type="text"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-transparent focus:border-zinc-500 focus:outline-none"
                  placeholder="Nome para contato"
                />
              </div>

              <div>
                <label htmlFor="contatoEmail" className="mb-1 block text-sm font-medium">
                  Email do Contato
                </label>
                <input
                  id="contatoEmail"
                  name="contatoEmail"
                  type="email"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-transparent focus:border-zinc-500 focus:outline-none"
                  placeholder="contato@empresa.com"
                />
              </div>
            </div>
          </fieldset>

          {/* Dados do CEO */}
          <fieldset>
            <legend className="text-sm font-semibold mb-3">Administrador (CEO)</legend>
            <div className="space-y-4">
              <div>
                <label htmlFor="ceoNome" className="mb-1 block text-sm font-medium">
                  Nome do CEO <span className="text-red-500">*</span>
                </label>
                <input
                  id="ceoNome"
                  name="ceoNome"
                  type="text"
                  required
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-transparent focus:border-zinc-500 focus:outline-none"
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label htmlFor="ceoCpf" className="mb-1 block text-sm font-medium">
                  CPF do CEO <span className="text-red-500">*</span>
                </label>
                <input
                  id="ceoCpf"
                  name="ceoCpf"
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={11}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-transparent focus:border-zinc-500 focus:outline-none"
                  placeholder="Apenas números"
                />
                <p className="mt-1 text-xs text-zinc-400">
                  O email (cpf@empresa.com) e senha (6 primeiros dígitos do CPF) serão gerados automaticamente
                </p>
              </div>
            </div>
          </fieldset>

          {/* Sessão de pagamento (criptograficamente assinada) */}
          <input type="hidden" name="sessionToken" value={sessionToken} />

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
          >
            Criar Conta
          </button>
        </form>
      </div>
    </div>
  )
}
