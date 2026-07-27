'use client'

import { Papel } from '@/lib/types'

interface PapelSelectProps {
  name?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
  required?: boolean
}

const PAPEIS_VISIVEIS: { value: Papel; label: string }[] = [
  { value: Papel.CEO, label: 'CEO' },
  { value: Papel.DIRETOR, label: 'Diretor' },
  { value: Papel.GERENTE, label: 'Gerente' },
  { value: Papel.SUPERVISOR, label: 'Supervisor' },
  { value: Papel.GESTOR, label: 'Gestor' },
  { value: Papel.LIDER, label: 'Líder' },
  { value: Papel.OPERACIONAL, label: 'Operacional' },
  { value: Papel.RH, label: 'RH' },
  { value: Papel.COLABORADOR, label: 'Colaborador' },
]

export default function PapelSelect({
  name,
  value,
  onChange,
  className = '',
  required = false,
}: PapelSelectProps) {
  const id = name ?? 'papel'

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value)
  }

  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={handleChange}
      required={required}
      className={`w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 ${className}`}
    >
      <option value="">Calcular automaticamente (baseado no líder)</option>
      {PAPEIS_VISIVEIS.map((p) => (
        <option key={p.value} value={p.value}>
          {p.label}
        </option>
      ))}
    </select>
  )
}
