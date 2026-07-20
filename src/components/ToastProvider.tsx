'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type TipoToast = 'sucesso' | 'erro'

interface Toast {
  id: number
  mensagem: string
  tipo: TipoToast
}

interface ToastContextType {
  mostrarToast: (mensagem: string, tipo?: TipoToast) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider')
  return ctx
}

let nextId = 0

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const mostrarToast = useCallback((mensagem: string, tipo: TipoToast = 'sucesso') => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, mensagem, tipo }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-right transition-all ${
              toast.tipo === 'sucesso'
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.mensagem}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
