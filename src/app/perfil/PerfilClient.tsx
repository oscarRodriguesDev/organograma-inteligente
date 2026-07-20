'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { atualizarPerfilColaboradorAction, alterarSenhaColaboradorAction } from '@/lib/colaborador-actions'
import type { AcoesColaborador } from '@/lib/permissions'
import Link from 'next/link'

interface InfoPerfil {
  id: string
  nome: string
  email: string | null
  cpf: string | null
  funcao: string
  papel: string
  username: string | null
  fotoUrl: string | null
  tema: string | null
  createdAt: string
  liderImediatoId: string | null
  empresaId: string | null
  acoes: AcoesColaborador
  liderNome: string | null
}

export default function PerfilClient({ perfil }: { perfil: InfoPerfil }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [msgSucesso, setMsgSucesso] = useState('')
  const [erro, setErro] = useState('')
  const [erroSenha, setErroSenha] = useState('')
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  const { acoes } = perfil

  async function handleUploadFoto(file: File) {
    setErro('')
    setMsgSucesso('')

    if (!file.type.startsWith('image/')) {
      setErro('O arquivo precisa ser uma imagem')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => setFotoPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    setEnviandoFoto(true)
    try {
      const formData = new FormData()
      formData.append('foto', file)

      const res = await fetch('/api/upload-foto', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.erro || 'Erro ao enviar foto')
        setFotoPreview(null)
        return
      }

      setMsgSucesso('Foto atualizada com sucesso!')
      router.refresh()
    } catch {
      setErro('Erro de conexão ao enviar foto')
      setFotoPreview(null)
    } finally {
      setEnviandoFoto(false)
    }
  }

  async function handlePerfil(formData: FormData) {
    setMsgSucesso('')
    setErro('')
    const res = await atualizarPerfilColaboradorAction(formData)
    if (res === 'ok') {
      setMsgSucesso('Perfil atualizado com sucesso!')
      router.refresh()
    } else {
      setErro(res)
    }
  }

  async function handleSenha(formData: FormData) {
    setMsgSucesso('')
    setErroSenha('')
    const res = await alterarSenhaColaboradorAction(formData)
    if (res.ok) {
      setMsgSucesso('Senha alterada com sucesso!')
      router.refresh()
    } else {
      setErroSenha(res.erro ?? 'Erro ao alterar senha')
    }
  }

  return (
    <>
      {msgSucesso && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm">
          {msgSucesso}
        </div>
      )}

      {/* Informações do colaborador */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-zinc-200 dark:border-zinc-700">
            {perfil.fotoUrl ? (
              <img src={perfil.fotoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-zinc-400">{perfil.nome.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{perfil.nome}</h2>
            <p className="text-sm text-zinc-500">{perfil.funcao}</p>
            <span className="inline-block mt-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-medium px-2 py-0.5">
              {perfil.papel}
            </span>
          </div>
        </div>

        {perfil.email && (
          <div className="text-sm text-zinc-500 mb-1">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Email:</span> {perfil.email}
          </div>
        )}
        {perfil.cpf && (
          <div className="text-sm text-zinc-500 mb-1">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">CPF:</span> {perfil.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
          </div>
        )}
        {perfil.liderNome && (
          <div className="text-sm text-zinc-500">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Líder:</span> {perfil.liderNome}
          </div>
        )}
      </div>

      {/* Ações disponíveis por papel */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Minhas Ações</h2>
        <div className="grid grid-cols-2 gap-3">
          {acoes.podeAlterarFoto && (
            <Link href="/perfil" onClick={(e) => { e.preventDefault(); fileInputRef.current?.click() }}
              className="flex items-center gap-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-sm">
              📷 Alterar Foto
            </Link>
          )}
          {acoes.podeFazerTestes && (
            <>
              <Link href="/fit-cultural"
                className="flex items-center gap-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-sm">
                🧪 Fit Cultural
              </Link>
              <Link href="/teste-disc"
                className="flex items-center gap-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-sm">
                📊 Teste DISC
              </Link>
              <Link href="/pesquisa-sentimento"
                className="flex items-center gap-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-sm">
                💭 Pesquisa Sentimento
              </Link>
            </>
          )}
          {acoes.podeSolicitarTestes && (
            <Link href="/avaliacoes/nova"
              className="flex items-center gap-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-sm">
              📝 Solicitar Avaliação
            </Link>
          )}
          {acoes.podeReuniao1a1 && (
            <Link href="/conversas/nova"
              className="flex items-center gap-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-sm">
              🤝 Reunião 1:1
            </Link>
          )}
          {acoes.podeReuniao1aTodos && (
            <Link href="/conversas/nova"
              className="flex items-center gap-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-sm">
              👥 Reunião com Equipe
            </Link>
          )}
          {acoes.podeAvaliarDesempenho && (
            <Link href="/avaliacoes"
              className="flex items-center gap-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-sm">
              ⭐ Avaliar Desempenho
            </Link>
          )}
          {acoes.podeDarFeedback && (
            <Link href="/conversas/nova"
              className="flex items-center gap-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-sm">
              💬 Dar Feedback
            </Link>
          )}
          {acoes.podeVerOrganograma && (
            <Link href="/organograma"
              className="flex items-center gap-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-sm">
              🏢 Ver Organograma
            </Link>
          )}
        </div>
      </div>

      {/* Foto de Perfil */}
      {acoes.podeAlterarFoto && (
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Foto de Perfil</h2>
          <div className="flex items-center gap-6">
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-zinc-200 dark:border-zinc-700">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : perfil.fotoUrl ? (
                  <img src={perfil.fotoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-10 h-10 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                )}
              </div>
              {enviandoFoto && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                Formatos aceitos: PNG, JPEG, WebP.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleUploadFoto(file)
                  e.target.value = ''
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={enviandoFoto}
                className="px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
              >
                {enviandoFoto ? 'Enviando...' : 'Escolher Foto'}
              </button>
              {erro && <p className="text-sm text-red-500 mt-2">{erro}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Informações do Perfil */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Informações do Perfil</h2>
        <form action={handlePerfil} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              Nome
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              required
              defaultValue={perfil.nome}
              placeholder="Seu nome"
              className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              Username (nome de exibição)
            </label>
            <input
              type="text"
              id="username"
              name="username"
              defaultValue={perfil.username ?? ''}
              placeholder="Seu username"
              className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>

          <div>
            <label htmlFor="tema" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              Tema da Plataforma
            </label>
            <select
              id="tema"
              name="tema"
              defaultValue={perfil.tema ?? 'system'}
              className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
            >
              <option value="system">Sistema (automático)</option>
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Salvar Alterações
          </button>
        </form>
      </div>

      {/* Alterar Senha */}
      {acoes.podeAlterarSenha && (
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Alterar Senha</h2>
          <form action={handleSenha} className="space-y-4">
            <div>
              <label htmlFor="senhaAtual" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Senha Atual *
              </label>
              <input
                type="password"
                id="senhaAtual"
                name="senhaAtual"
                required
                className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
            <div>
              <label htmlFor="novaSenha" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Nova Senha *
              </label>
              <input
                type="password"
                id="novaSenha"
                name="novaSenha"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
            <div>
              <label htmlFor="confirmarSenha" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Confirmar Nova Senha *
              </label>
              <input
                type="password"
                id="confirmarSenha"
                name="confirmarSenha"
                required
                minLength={6}
                className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>

            {erroSenha && <p className="text-sm text-red-500">{erroSenha}</p>}

            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Alterar Senha
            </button>
          </form>
        </div>
      )}
    </>
  )
}
