export default function AvaliacoesLoading() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-40 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-9 w-36 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-64 rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-3 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
                </div>
                <div className="h-5 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-8 rounded bg-zinc-100 dark:bg-zinc-800/50" />
                <div className="h-8 rounded bg-zinc-100 dark:bg-zinc-800/50" />
                <div className="h-8 rounded bg-zinc-100 dark:bg-zinc-800/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
