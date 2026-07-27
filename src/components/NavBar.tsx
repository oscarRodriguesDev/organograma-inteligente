'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { logoutAction } from '@/lib/auth-actions'
import ThemeToggle from './ThemeToggle'

interface NavBarSession {
  colaboradorId: string
  empresaId: string
  empresaNome: string
  nome: string
  papel: string
  fotoUrl?: string | null
  username?: string | null
}

interface NavBarProps {
  session: NavBarSession | null
  testesDisponiveis?: { id: string; titulo: string; tipo: string }[]
}

function showDevAlert() {
  alert('🚧 Esse recurso ainda está em desenvolvimento')
}

// ─── Item de menu ativo ──────────────────────────
function NavLink({ href, label, isActive }: { href: string; label: string; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`
        relative px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
        ${isActive
          ? 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800'
          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
        }
      `}
    >
      {label}
      {isActive && (
        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-zinc-900 dark:bg-white rounded-full" />
      )}
    </Link>
  )
}

// ─── Item de menu desabilitado ────────────────────
function DisabledNavItem({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={showDevAlert}
      className="px-3 py-1.5 text-sm font-medium rounded-lg text-zinc-300 dark:text-zinc-600 cursor-not-allowed select-none transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
    >
      {label}
    </button>
  )
}

// ─── Dropdown de Testes ───────────────────────────
function TestesDropdown({
  testes,
  pathname,
}: {
  testes: { id: string; titulo: string; tipo: string }[]
  pathname: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = pathname.startsWith('/testes')

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
          ${isActive || open
            ? 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }
        `}
      >
        Testes
        <svg
          className={`w-3.5 h-3.5 mt-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg py-1.5 z-50">
          {testes.length === 0 ? (
            <div className="px-4 py-4 text-center">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Ainda não há testes disponíveis na plataforma
              </p>
            </div>
          ) : (
            testes.map(teste => (
              <Link
                key={teste.id}
                href={`/testes/${teste.id}`}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors
                  ${pathname === `/testes/${teste.id}`
                    ? 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 font-medium'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }
                `}
              >
                <span className="truncate flex-1">{teste.titulo}</span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase shrink-0">
                  {teste.tipo}
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Dropdown de Colaboradores ──────────────────────
function ColaboradoresDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isParentActive =
    pathname.startsWith('/colaboradores') ||
    pathname.startsWith('/avaliacoes') ||
    pathname.startsWith('/conversas') ||
    pathname.startsWith('/advertencias') ||
    pathname.startsWith('/suspensoes') ||
    pathname.startsWith('/iniciativas') ||
    pathname.startsWith('/metricas') ||
    pathname.startsWith('/projetos')

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
          ${isParentActive || open
            ? 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }
        `}
      >
        Colaboradores
        <svg
          className={`w-3.5 h-3.5 mt-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg py-1.5 z-50">
          <Link
            href="/colaboradores"
            onClick={() => setOpen(false)}
            className={`
              flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors
              ${pathname === '/colaboradores'
                ? 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 font-medium'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }
            `}
          >
            Visão Geral
          </Link>
          <Link
            href="/avaliacoes"
            onClick={() => setOpen(false)}
            className={`
              flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors
              ${pathname.startsWith('/avaliacoes')
                ? 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 font-medium'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }
            `}
          >
            Avaliações
          </Link>
          <Link
            href="/conversas"
            onClick={() => setOpen(false)}
            className={`
              flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors
              ${pathname.startsWith('/conversas')
                ? 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 font-medium'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }
            `}
          >
            Conversas
          </Link>
          <hr className="my-1 mx-2 border-zinc-200 dark:border-zinc-700" />
          <Link
            href="/advertencias"
            onClick={() => setOpen(false)}
            className={`
              flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors
              ${pathname.startsWith('/advertencias')
                ? 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 font-medium'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }
            `}
          >
            Advertências
          </Link>
          <Link
            href="/suspensoes"
            onClick={() => setOpen(false)}
            className={`
              flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors
              ${pathname.startsWith('/suspensoes')
                ? 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 font-medium'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }
            `}
          >
            Suspensões
          </Link>
          <Link
            href="/iniciativas"
            onClick={() => setOpen(false)}
            className={`
              flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors
              ${pathname.startsWith('/iniciativas')
                ? 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 font-medium'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }
            `}
          >
            Iniciativas
          </Link>
          <Link
            href="/metricas"
            onClick={() => setOpen(false)}
            className={`
              flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors
              ${pathname.startsWith('/metricas')
                ? 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 font-medium'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }
            `}
          >
            Métricas
          </Link>
          <Link
            href="/projetos"
            onClick={() => setOpen(false)}
            className={`
              flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors
              ${pathname.startsWith('/projetos')
                ? 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 font-medium'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }
            `}
          >
            Projetos
          </Link>
          <button
            type="button"
            onClick={() => { setOpen(false); showDevAlert() }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-zinc-400 dark:text-zinc-500 cursor-not-allowed select-none hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Sentimento
          </button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
//  NavBar Principal
// ═══════════════════════════════════════════════════════

export default function NavBar({ session, testesDisponiveis = [] }: NavBarProps) {
  const pathname = usePathname()
  const isAdmin = session?.papel === 'ADMIN_PLATAFORMA' || session?.papel === 'ADMIN_SUPORTE' || session?.papel === 'ADMIN_PSICH'
  const isSuperAdmin = session?.papel === 'ADMIN_PLATAFORMA'
  const isPsichAdmin = session?.papel === 'ADMIN_PSICH'

  // Admin Navigation
  if (isAdmin && session) {
    return (
      <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-base text-foreground">
            <span className="w-7 h-7 rounded-lg bg-[#0EA5E9] dark:bg-[#38BDF8] flex items-center justify-center text-xs font-bold text-white dark:text-[#0B1121]">
              OG
            </span>
            <span className="hidden sm:inline">
              <span className="text-[#0EA5E9] dark:text-[#38BDF8]">OxyGen</span>{' '}
              <span className="font-light text-zinc-500 dark:text-zinc-400">AI</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {isSuperAdmin && (
              <NavLink href="/admin" label="Dashboard" isActive={pathname === '/admin'} />
            )}
            {isPsichAdmin && (
              <NavLink href="/admin/testes-psicologicos" label="Testes" isActive={pathname.startsWith('/admin/testes-psicologicos')} />
            )}
            <NavLink href="/admin/empresas" label="Empresas" isActive={pathname.startsWith('/admin/empresas')} />
            {isSuperAdmin && (
              <>
                <NavLink href="/admin/gastos" label="Gastos" isActive={pathname === '/admin/gastos'} />
                <NavLink href="/admin/financeiro" label="Financeiro" isActive={pathname.startsWith('/admin/financeiro') || pathname.startsWith('/admin/investimentos')} />
              </>
            )}
          </div>

          {/* User area */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/admin/perfil"
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                {session.fotoUrl ? (
                  <img src={session.fotoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-300">
                    {session.nome.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                {session.username || session.nome}
              </span>
            </Link>
            <form action={logoutAction} className="m-0">
              <button
                type="submit"
                className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                Sair
              </button>
            </form>
          </div>
        </nav>
      </header>
    )
  }

  // User Navigation
  if (session) {
    return (
      <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-base text-foreground">
            <span className="w-7 h-7 rounded-lg bg-[#0EA5E9] dark:bg-[#38BDF8] flex items-center justify-center text-xs font-bold text-white dark:text-[#0B1121]">
              OG
            </span>
            <span className="hidden sm:inline">
              {session.empresaNome ? (
                session.empresaNome
              ) : (
                <><span className="text-[#0EA5E9] dark:text-[#38BDF8]">OxyGen</span> <span className="font-light text-zinc-500 dark:text-zinc-400">AI</span></>
              )}
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/organograma" label="Organograma" isActive={pathname.startsWith('/organograma')} />
            <NavLink href="/meu-desempenho" label="Meu Desempenho" isActive={pathname.startsWith('/meu-desempenho')} />
            <ColaboradoresDropdown pathname={pathname} />

            <DisabledNavItem label="Regras" />
            {session && ['GESTOR', 'SUPERVISOR', 'GERENTE', 'DIRETOR', 'CEO', 'RH', 'ADMIN_PLATAFORMA', 'ADMIN_SUPORTE'].includes(session.papel) && (
              <NavLink href="/gestao/testes" label="Gestão" isActive={pathname.startsWith('/gestao')} />
            )}
            <TestesDropdown testes={testesDisponiveis} pathname={pathname} />

            <span className="mx-2 w-px h-5 bg-zinc-200 dark:border-zinc-700" />
          </div>

          {/* Mobile menu - dropdown compacto */}
          <MobileMenu session={session} pathname={pathname} testesDisponiveis={testesDisponiveis} />

          {/* User area - desktop */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/perfil"
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                {session.fotoUrl ? (
                  <img src={session.fotoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-300">
                    {session.nome.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                {session.username || session.nome}
              </span>
            </Link>
            <form action={logoutAction} className="m-0">
              <button
                type="submit"
                className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                Sair
              </button>
            </form>
          </div>
        </nav>
      </header>
    )
  }

  // Not logged in
  return null
}

// ═══════════════════════════════════════════════════════
//  Mobile Menu
// ═══════════════════════════════════════════════════════

function MobileMenu({
  session,
  pathname,
  testesDisponiveis,
}: {
  session: NavBarSession
  pathname: string
  testesDisponiveis: { id: string; titulo: string; tipo: string }[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div ref={ref} className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        aria-label="Menu"
      >
        <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-0 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-lg py-3 px-4 z-50">
          <div className="flex flex-col gap-1">
            <MobileLink href="/organograma" label="Organograma" isActive={pathname.startsWith('/organograma')} />
            <MobileLink href="/meu-desempenho" label="Meu Desempenho" isActive={pathname.startsWith('/meu-desempenho')} />
            <MobileColaboradoresSection pathname={pathname} />

            <hr className="my-2 border-zinc-200 dark:border-zinc-700" />

            <MobileDisabled label="Regras" />

            {['GESTOR', 'SUPERVISOR', 'GERENTE', 'DIRETOR', 'CEO', 'RH', 'ADMIN_PLATAFORMA', 'ADMIN_SUPORTE'].includes(session.papel) && (
              <MobileLink
                href="/gestao/testes"
                label="Gestão de Testes"
                isActive={pathname.startsWith('/gestao')}
              />
            )}

            {/* Testes no mobile */}
            {testesDisponiveis.length === 0 ? (
              <div className="px-3 py-2 rounded-lg text-sm text-zinc-400 dark:text-zinc-500 italic">
                Testes — nenhum disponível
              </div>
            ) : (
              testesDisponiveis.map(teste => (
                <MobileLink
                  key={teste.id}
                  href={`/testes/${teste.id}`}
                  label={teste.titulo}
                  isActive={pathname === `/testes/${teste.id}`}
                />
              ))
            )}

            <hr className="my-2 border-zinc-200 dark:border-zinc-700" />

            <div className="flex items-center justify-between pt-1">
              <Link href="/perfil" className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-500 dark:text-zinc-300">
                  {session.nome.charAt(0).toUpperCase()}
                </div>
                {session.username || session.nome}
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MobileLink({ href, label, isActive }: { href: string; label: string; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`
        block px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${isActive
          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
          : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
        }
      `}
    >
      {label}
    </Link>
  )
}

function MobileDisabled({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={showDevAlert}
      className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 dark:text-zinc-600 cursor-not-allowed select-none"
    >
      {label}
    </button>
  )
}

function MobileColaboradoresSection({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false)

  const isParentActive =
    pathname.startsWith('/colaboradores') ||
    pathname.startsWith('/avaliacoes') ||
    pathname.startsWith('/conversas') ||
    pathname.startsWith('/advertencias') ||
    pathname.startsWith('/suspensoes') ||
    pathname.startsWith('/iniciativas') ||
    pathname.startsWith('/metricas') ||
    pathname.startsWith('/projetos')

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${isParentActive || open
            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
            : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }
        `}
      >
        Colaboradores
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="ml-3 mt-1 flex flex-col gap-0.5">
          <MobileLink href="/colaboradores" label="Visão Geral" isActive={pathname === '/colaboradores'} />
          <MobileLink href="/avaliacoes" label="Avaliações" isActive={pathname.startsWith('/avaliacoes')} />
          <MobileLink href="/conversas" label="Conversas" isActive={pathname.startsWith('/conversas')} />
          <MobileLink href="/advertencias" label="Advertências" isActive={pathname.startsWith('/advertencias')} />
          <MobileLink href="/suspensoes" label="Suspensões" isActive={pathname.startsWith('/suspensoes')} />
          <MobileLink href="/iniciativas" label="Iniciativas" isActive={pathname.startsWith('/iniciativas')} />
          <MobileLink href="/metricas" label="Métricas" isActive={pathname.startsWith('/metricas')} />
          <MobileLink href="/projetos" label="Projetos" isActive={pathname.startsWith('/projetos')} />
        </div>
      )}
    </div>
  )
}
