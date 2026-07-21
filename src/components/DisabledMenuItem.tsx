'use client'

interface Props {
  label: string
}

export default function DisabledMenuItem({ label }: Props) {
  function handleClick() {
    alert('🚧 Esse recurso ainda está em desenvolvimento')
  }

  return (
    <span
      onClick={handleClick}
      className="text-zinc-400 dark:text-zinc-600 cursor-not-allowed select-none transition-colors text-sm"
    >
      {label}
    </span>
  )
}
