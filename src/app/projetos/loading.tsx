export default function ProjetosLoading() {
  return (
    <div className="flex-1 p-8">
      <div className="mx-auto max-w-5xl animate-pulse">
        <div className="mb-8 flex items-center justify-between">
          <div className="h-8 w-40 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-9 w-36 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                {['Nome', 'Status', 'Data Início', 'Data Fim', 'Ações'].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left font-medium text-zinc-600"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <div className="h-5 w-48 rounded bg-zinc-200 dark:bg-zinc-700" />
                    <div className="mt-1 h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-5 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-5 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-5 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="ml-auto h-4 w-14 rounded bg-zinc-200 dark:bg-zinc-700" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
