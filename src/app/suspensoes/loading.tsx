export default function SuspensoesLoading() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-5xl mx-auto animate-pulse">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-44 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-9 w-40 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800/50"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
