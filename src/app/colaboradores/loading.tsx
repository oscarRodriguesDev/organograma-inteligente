export default function ColaboradoresLoading() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-9 w-36 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <div className="bg-zinc-50 dark:bg-zinc-900 px-4 py-3 flex gap-8">
            <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-4 w-28 rounded bg-zinc-200 dark:bg-zinc-700 ml-auto" />
          </div>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-8">
                <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-5 w-14 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-4 w-28 rounded bg-zinc-200 dark:bg-zinc-700 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
