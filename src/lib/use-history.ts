'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * useState com suporte a undo/redo com limite FIFO.
 *
 * Uso:
 *   const { state, setState, undo, redo, canUndo, canRedo } = useStateWithHistory(initial, maxHistory)
 *
 * - setState aceita tanto valor direto quanto função updater (igual useState)
 * - undo/redo: funções para navegar no histórico
 * - maxHistory: máximo de estados passados guardados (default 10)
 */
export function useStateWithHistory<T>(
  initial: T,
  maxHistory = 10
): {
  state: T
  setState: (value: T | ((prev: T) => T)) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
} {
  const [state, setState] = useState<T>(initial)
  const pastRef = useRef<T[]>([])
  const futureRef = useRef<T[]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const syncFlags = useCallback(() => {
    setCanUndo(pastRef.current.length > 0)
    setCanRedo(futureRef.current.length > 0)
  }, [])

  const setStateWithHistory = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value

        // Ignora se for o mesmo objeto (evita loops)
        if (next === prev) return prev

        // Grava o estado anterior no histórico (push FIFO limitado)
        pastRef.current = [...pastRef.current.slice(-(maxHistory - 1)), prev]
        futureRef.current = [] // nova ação limpa o "futuro" (redo)

        return next
      })
    },
    [maxHistory]
  )

  // Sincroniza flags após cada setState
  useEffect(() => {
    syncFlags()
  }, [state, syncFlags])

  const undo = useCallback(() => {
    const prev = pastRef.current.pop()
    if (prev === undefined) return
    setState((current) => {
      futureRef.current = [...futureRef.current, current]
      return prev
    })
  }, [])

  const redo = useCallback(() => {
    const next = futureRef.current.pop()
    if (next === undefined) return
    setState((current) => {
      pastRef.current = [...pastRef.current, current]
      return next
    })
  }, [])

  // Atalhos de teclado: Shift+Z = desfazer, Shift+R = refazer
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignora se estiver digitando em inputs/textareas
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.shiftKey && e.key === 'Z') {
        e.preventDefault()
        undo()
      }
      if (e.shiftKey && e.key === 'R') {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  return { state, setState: setStateWithHistory, undo, redo, canUndo, canRedo }
}
