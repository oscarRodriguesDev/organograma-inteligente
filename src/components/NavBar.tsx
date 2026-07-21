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
function TestesDropdown() {
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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
          text-zinc-300 dark:text-zinc-600 cursor-not-allowed select-none
          hover:bg-zinc-50 dark:hover:bg-zinc-800/30
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
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg py-1.5 z-50">
          <button
            type="button"
            onClick={() => { setOpen(false); showDevAlert() }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-zinc-400 dark:text-zinc-500 cursor-not-allowed select-none hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <span className="text-xs">🧪</span>
            Fit Cultural
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); showDevAlert() }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-zinc-400 dark:text-zinc-500 cursor-not-allowed select-none hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <span className="text-xs">📊</span>
            Teste DISC
          </button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
//  NavBar Principal
// ═══════════════════════════════════════════════════════

export default function NavBar({ session }: NavBarProps) {
  const pathname = usePathname()
  const isAdmin = session?.papel === 'ADMIN_PLATAFORMA' || session?.papel === 'ADMIN_SUPORTE'
  const isSuperAdmin = session?.papel === 'ADMIN_PLATAFORMA'

  // Admin Navigation
  if (isAdmin && session) {
    return (
      <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-base text-foreground">
            <span className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center text-xs font-bold text-white dark:text-black">
              OI
            </span>
            <span className="hidden sm:inline">Organograma</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {isSuperAdmin && (
              <NavLink href="/admin" label="Dashboard" isActive={pathname === '/admin'} />
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
            <span className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center text-xs font-bold text-white dark:text-black">
              OI
            </span>
            <span className="hidden sm:inline">{session.empresaNome || 'Organograma'}</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/organograma" label="Organograma" isActive={pathname.startsWith('/organograma')} />
            <NavLink href="/colaboradores" label="Colaboradores" isActive={pathname.startsWith('/colaboradores')} />
            <NavLink href="/avaliacoes" label="Avaliações" isActive={pathname.startsWith('/avaliacoes')} />

            {/* Separador visual */}
            <span className="mx-2 w-px h-5 bg-zinc-200 dark:bg-zinc-700" />

            {/* Itens desabilitados */}
            <DisabledNavItem label="Iniciativas" />
            <DisabledNavItem label="Métricas" />
            <DisabledNavItem label="Regras" />
            <TestesDropdown />
            <DisabledNavItem label="Sentimento" />

            <span className="mx-2 w-px h-5 bg-zinc-200 dark:bg-zinc-700" />

            <NavLink href="/conversas" label="Conversas" isActive={pathname.startsWith('/conversas')} />
          </div>

          {/* Mobile menu - dropdown compacto */}
          <MobileMenu session={session} pathname={pathname} />

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

function MobileMenu({ session, pathname }: { session: NavBarSession; pathname: string }) {
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
            <MobileLink href="/colaboradores" label="Colaboradores" isActive={pathname.startsWith('/colaboradores')} />
            <MobileLink href="/avaliacoes" label="Avaliações" isActive={pathname.startsWith('/avaliacoes')} />
            <MobileLink href="/conversas" label="Conversas" isActive={pathname.startsWith('/conversas')} />

            <hr className="my-2 border-zinc-200 dark:border-zinc-700" />

            <MobileDisabled label="Iniciativas" />
            <MobileDisabled label="Métricas" />
            <MobileDisabled label="Regras" />
            <MobileDisabled label="Fit Cultural" />
            <MobileDisabled label="Teste DISC" />
            <MobileDisabled label="Sentimento" />

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
