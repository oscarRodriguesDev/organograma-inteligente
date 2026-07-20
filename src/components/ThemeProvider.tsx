'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'light' | 'dark' | 'system'

const ThemeContext = createContext({
  theme: 'system' as Theme,
  toggleTheme: () => {},
  setThemePref: (_t: Theme) => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : null
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  // Inicializa: cookie > localStorage > system
  useEffect(() => {
    const cookieTheme = getCookie('tema') as Theme | null
    if (cookieTheme === 'light' || cookieTheme === 'dark' || cookieTheme === 'system') {
      setTheme(cookieTheme)
    } else {
      const stored = localStorage.getItem('theme') as Theme | null
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setTheme(stored)
      }
    }
    setMounted(true)
  }, [])

  // Aplica o tema no HTML
  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    let effective: string
    if (theme === 'system') {
      effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      effective = theme
    }

    if (effective === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      if (prev === 'light') return 'dark'
      if (prev === 'dark') return 'system'
      return 'light'
    })
  }, [])

  const setThemePref = useCallback((t: Theme) => {
    setTheme(t)
  }, [])

  // Escuta mudanças na preferência do sistema
  useEffect(() => {
    if (!mounted || theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const root = document.documentElement
      if (mq.matches) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mounted, theme])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemePref }}>
      {children}
    </ThemeContext.Provider>
  )
}
