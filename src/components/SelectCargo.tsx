'use client'

import { useEffect, useState, useRef } from 'react'
import { listarCargosAction } from '@/lib/actions'

interface Props {
  /** Para uncontrolled (form submit) */
  name?: string
  /** Para controlled component */
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  required?: boolean
  placeholder?: string
  className?: string
  /** Lista pré-carregada (evita fetch duplicado) */
  cargosList?: { id: string; nome: string }[]
}

export default function SelectCargo({
  name,
  value: controlledValue,
  onChange: controlledOnChange,
  onBlur,
  required,
  placeholder = 'Selecione ou digite um cargo',
  className = '',
  cargosList,
}: Props) {
  const [cargos, setCargos] = useState<{ id: string; nome: string }[]>([])
  const [modo, setModo] = useState<'select' | 'novo'>('select')
  const [novoNome, setNovoNome] = useState('')
  const [selectValue, setSelectValue] = useState(controlledValue ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  const isControlled = controlledValue !== undefined

  // Carrega cargos ao montar (sempre). Se cargosList for fornecida, usa ela
  // como complemento após o fetch inicial.
  useEffect(() => {
    listarCargosAction().then((dados) => {
      // Mescla dados do servidor com lista pré-carregada (se houver)
      const merged = cargosList && cargosList.length > 0
        ? [...new Map([...dados, ...cargosList].map((c) => [c.nome, c])).values()]
        : dados
      setCargos(merged)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sincroniza quando controlledValue muda
  useEffect(() => {
    if (isControlled) setSelectValue(controlledValue)
  }, [controlledValue, isControlled])

  function notificar(val: string) {
    if (isControlled && controlledOnChange) {
      controlledOnChange(val)
    }
  }

  function aoSelecionar(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    if (val === '__novo__') {
      setModo('novo')
      setNovoNome('')
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setSelectValue(val)
      notificar(val)
    }
  }

  function confirmarNovo() {
    const nome = novoNome.trim()
    if (!nome) return
    setCargos((prev) => {
      if (prev.some((c) => c.nome === nome)) return prev
      return [...prev, { id: `new-${Date.now()}`, nome }]
    })
    setSelectValue(nome)
    notificar(nome)
    setModo('select')
    setNovoNome('')
  }

  function cancelarNovo() {
    setModo('select')
    setNovoNome('')
  }

  if (modo === 'novo') {
    return (
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); confirmarNovo() }
            if (e.key === 'Escape') cancelarNovo()
          }}
          placeholder="Digite o novo cargo..."
          required={required}
          className={`flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 ${className}`}
          autoFocus
        />
        <button
          type="button"
          onClick={confirmarNovo}
          className="rounded-lg bg-black dark:bg-white px-3 py-2 text-xs font-medium text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          Adicionar
        </button>
        <button
          type="button"
          onClick={cancelarNovo}
          className="rounded-lg border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <select
      name={isControlled ? undefined : name}
      value={selectValue}
      onChange={aoSelecionar}
      onBlur={onBlur}
      required={required}
      className={`w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 ${className}`}
    >
      <option value="">{placeholder}</option>
      {cargos.map((c) => (
        <option key={c.id} value={c.nome}>
          {c.nome}
        </option>
      ))}
      <option value="__novo__">+ Adicionar novo cargo</option>
    </select>
  )
}
