'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react'

export interface Column<T> {
  key: string
  label: string
  searchable?: boolean
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
  pageSize?: number
  searchPlaceholder?: string
  extraFilters?: React.ReactNode
  topRight?: React.ReactNode
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  emptyMessage = 'No data found',
  pageSize: defaultPageSize = 10,
  searchPlaceholder = 'Search...',
  extraFilters,
  topRight,
}: DataTableProps<T>) {
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const searchable = columns.filter(c => c.searchable !== false)

  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter(row =>
      searchable.some(col => {
        const val = row[col.key]
        if (val == null) return false
        if (typeof val === 'object') return JSON.stringify(val).toLowerCase().includes(q)
        return String(val).toLowerCase().includes(q)
      })
    )
  }, [data, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const start      = (safePage - 1) * pageSize
  const paged      = filtered.slice(start, start + pageSize)

  const goTo = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)))

  // Reset to page 1 when search changes
  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handlePageSize = (v: number) => { setPageSize(v); setPage(1) }

  const pageNumbers = () => {
    const pages: (number | '...')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (safePage > 3) pages.push('...')
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i)
      if (safePage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:border-[#1a3a2a] focus:ring-2 focus:ring-[#1a3a2a]/10 text-sm transition-all"
          />
        </div>
        {extraFilters}
        {topRight}
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between text-xs text-foreground/50 px-1">
        <span>
          {filtered.length === 0
            ? 'No results'
            : `Showing ${start + 1}–${Math.min(start + pageSize, filtered.length)} of ${filtered.length} ${filtered.length !== data.length ? `(filtered from ${data.length})` : ''}`}
        </span>
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={e => handlePageSize(Number(e.target.value))}
            className="border border-border rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:border-[#1a3a2a]"
          >
            {[5, 10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-[#f8faf8]">
                {columns.map(col => (
                  <th key={col.key} className="text-left px-5 py-3.5 font-semibold text-foreground/60 whitespace-nowrap text-xs uppercase tracking-wide">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-16 text-foreground/40">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-[#f8faf8] flex items-center justify-center text-2xl">🔍</div>
                      <p className="font-medium">{search ? `No results for "${search}"` : emptyMessage}</p>
                      {search && <button onClick={() => handleSearch('')} className="text-xs text-[#1a3a2a] underline">Clear search</button>}
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((row, i) => (
                  <tr key={row._id ?? i} className="border-b border-border/40 hover:bg-[#f8faf8]/80 transition-colors">
                    {columns.map(col => (
                      <td key={col.key} className="px-5 py-3.5 text-foreground whitespace-nowrap">
                        {col.render ? col.render(row) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-1">
          <button onClick={() => goTo(1)} disabled={safePage === 1}
            className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button onClick={() => goTo(safePage - 1)} disabled={safePage === 1}
            className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pageNumbers().map((p, i) =>
            p === '...' ? (
              <span key={`dots-${i}`} className="px-2 text-foreground/40 text-sm">…</span>
            ) : (
              <button key={p} onClick={() => goTo(p as number)}
                className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors
                  ${safePage === p ? 'bg-[#1a3a2a] text-white shadow-sm' : 'hover:bg-secondary text-foreground'}`}>
                {p}
              </button>
            )
          )}

          <button onClick={() => goTo(safePage + 1)} disabled={safePage === totalPages}
            className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => goTo(totalPages)} disabled={safePage === totalPages}
            className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
