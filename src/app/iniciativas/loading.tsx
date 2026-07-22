export default function IniciativasLoading() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-40 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-9 w-36 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 space-y-3"
            >
              <div className="h-5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
