interface Column<T> {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
}

export default function DataTable<T extends Record<string, any>>({ columns, data, emptyMessage = 'No data found' }: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-[#f8faf8]">
              {columns.map((col) => (
                <th key={String(col.key)} className="text-left px-6 py-4 font-semibold text-foreground/70 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-foreground/50">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-[#f8faf8] transition-colors">
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-6 py-4 text-foreground whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.key as string]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
