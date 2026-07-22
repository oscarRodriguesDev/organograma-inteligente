export default function ConversasLoading() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-8 w-36 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="h-9 w-32 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-20 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-700" />
                </div>
                <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
              <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="flex gap-3">
                <div className="h-3 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-3 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
