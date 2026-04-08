import { useState, useMemo } from 'react'
import { Download, Copy, ChevronUp, ChevronDown, ChevronsUpDown, AlertCircle, Loader } from 'lucide-react'
import useStore from '../../store'

const PAGE_SIZE = 100

export default function ResultsPanel() {
  const { results, queryError, isExecuting } = useStore()
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [filterText, setFilterText] = useState('')
  const [page, setPage] = useState(0)

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
    setPage(0)
  }

  const filteredRows = useMemo(() => {
    if (!results?.rows) return []
    let rows = [...results.rows]

    if (filterText.trim()) {
      const lower = filterText.toLowerCase()
      rows = rows.filter((row) =>
        row.some((cell) => String(cell ?? '').toLowerCase().includes(lower))
      )
    }

    if (sortCol !== null) {
      const idx = results.columns.indexOf(sortCol)
      rows.sort((a, b) => {
        const av = a[idx] ?? ''
        const bv = b[idx] ?? ''
        if (av < bv) return sortDir === 'asc' ? -1 : 1
        if (av > bv) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    }

    return rows
  }, [results, filterText, sortCol, sortDir])

  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE)
  const pageRows = filteredRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleCopyCSV = () => {
    if (!results) return
    const header = results.columns.join('\t')
    const body = filteredRows.map((r) => r.join('\t')).join('\n')
    navigator.clipboard.writeText(`${header}\n${body}`)
  }

  const handleExportCSV = () => {
    if (!results) return
    const header = results.columns.join(',')
    const body = filteredRows
      .map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const content = `${header}\n${body}`

    if (window.electronAPI) {
      window.electronAPI.saveFile({ filename: 'results.csv', content })
    } else {
      const blob = new Blob([content], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'results.csv'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#0f172a]">
      {/* Results toolbar */}
      <div className="flex items-center gap-3 px-3 py-1.5 bg-[#172033] border-b border-slate-700/60 shrink-0">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Results
        </span>

        {results && (
          <>
            <span className="text-xs text-slate-500">
              {filteredRows.length} row{filteredRows.length !== 1 ? 's' : ''}
              {results.executionTime != null && (
                <> &nbsp;·&nbsp; {results.executionTime} ms</>
              )}
            </span>

            <input
              value={filterText}
              onChange={(e) => { setFilterText(e.target.value); setPage(0) }}
              placeholder="Filter results…"
              className="ml-2 bg-[#1e293b] border border-slate-600 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder:text-slate-600 w-40"
            />

            <div className="flex-1" />

            <button
              onClick={handleCopyCSV}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
              title="Copy as TSV"
            >
              <Copy size={12} /> Copy
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
              title="Export CSV"
            >
              <Download size={12} /> CSV
            </button>
          </>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto">
        {isExecuting && (
          <div className="flex items-center justify-center h-full gap-2 text-slate-400 text-sm">
            <Loader size={16} className="animate-spin" /> Executing query…
          </div>
        )}

        {!isExecuting && queryError && (
          <div className="flex items-start gap-2 m-4 p-3 bg-red-900/20 border border-red-700/40 rounded text-red-400 text-xs">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <pre className="whitespace-pre-wrap">{queryError}</pre>
          </div>
        )}

        {!isExecuting && !queryError && results && (
          <table className="text-xs w-full border-collapse">
            <thead className="sticky top-0 bg-[#172033] z-10">
              <tr>
                {results.columns.map((col) => (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="px-3 py-2 text-left font-medium text-slate-400 border-b border-slate-700/60 whitespace-nowrap cursor-pointer hover:text-white select-none"
                  >
                    <div className="flex items-center gap-1">
                      {col}
                      {sortCol === col ? (
                        sortDir === 'asc' ? (
                          <ChevronUp size={11} />
                        ) : (
                          <ChevronDown size={11} />
                        )
                      ) : (
                        <ChevronsUpDown size={11} className="opacity-30" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, ri) => (
                <tr
                  key={ri}
                  className={ri % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-3 py-1.5 border-b border-slate-800/60 text-slate-300 max-w-[300px] truncate"
                      title={String(cell ?? '')}
                    >
                      {cell === null ? (
                        <span className="text-slate-600 italic">NULL</span>
                      ) : (
                        String(cell)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isExecuting && !queryError && !results && (
          <p className="text-xs text-slate-600 px-4 py-3">
            Run a query to see results here.
          </p>
        )}
      </div>

      {/* Pagination */}
      {results && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-[#172033] border-t border-slate-700/60 text-xs text-slate-400 shrink-0">
          <span>
            Page {page + 1} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-2 py-0.5 border border-slate-700 rounded disabled:opacity-40 hover:border-slate-500 transition-colors"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-2 py-0.5 border border-slate-700 rounded disabled:opacity-40 hover:border-slate-500 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
