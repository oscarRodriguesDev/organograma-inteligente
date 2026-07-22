export default function RootLoading() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto animate-pulse">
        {/* Skeleton do header */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-9 w-32 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Skeleton da tabela/lista */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-lg bg-zinc-100 dark:bg-zinc-800/50"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
