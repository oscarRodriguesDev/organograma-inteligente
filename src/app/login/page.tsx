import { loginAction } from '@/lib/auth-actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; sucesso?: string }>
}) {
  const { erro, sucesso } = await searchParams

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-center mb-1">
            <span className="text-[#0EA5E9] dark:text-[#38BDF8]">OxyGen</span>{' '}
            <span className="text-foreground font-light">AI</span>
          </h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">O ar que sua organização precisa</p>
        </div>
        <p className="text-sm text-zinc-500 text-center mb-6">Faça login para continuar</p>

        {sucesso && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            Conta criada com sucesso! Faça login para acessar.
          </div>
        )}

        {erro && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            Email ou senha inválidos.
          </div>
        )}

        <form action={loginAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email ou Username
            </label>
            <input
              id="email"
              name="email"
              type="text"
              required
              autoFocus
              autoComplete="username"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="seu@email.com ou usuario"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              placeholder="Sua senha"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
