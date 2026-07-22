export default function OrganogramaLoading() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto animate-pulse">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex gap-2">
            <div className="h-9 w-28 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-9 w-28 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>

        {/* Skeleton do organograma */}
        <div className="flex flex-col items-center gap-12 py-12">
          {/* CEO */}
          <div className="h-16 w-48 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          {/* Linha */}
          <div className="h-12 w-px bg-zinc-200 dark:bg-zinc-700" />
          {/* Diretores */}
          <div className="flex gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 w-36 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            ))}
          </div>
          {/* Linhas */}
          <div className="flex gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 w-px bg-zinc-200 dark:bg-zinc-700" />
            ))}
          </div>
          {/* Gerentes */}
          <div className="flex gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 w-32 rounded-xl bg-zinc-100 dark:bg-zinc-800/50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
