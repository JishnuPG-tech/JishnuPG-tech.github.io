import { X, Clock, Play, Trash2 } from 'lucide-react'
import useStore from '../../store'

export default function QueryHistory() {
  const { history, clearHistory, setShowHistory, getActiveTab, updateTabSql, activeTabId } = useStore()

  const handleRerun = (sql) => {
    if (activeTabId) {
      updateTabSql(activeTabId, sql)
    }
    setShowHistory(false)
    // Slight delay so the editor updates first
    setTimeout(() => useStore.getState().executeQuery(), 100)
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1e293b] border border-slate-700 rounded-lg w-[640px] max-h-[70vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2 text-slate-200 font-medium">
            <Clock size={16} className="text-blue-400" />
            Query History
          </div>
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors"
              >
                <Trash2 size={13} /> Clear
              </button>
            )}
            <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1">
          {history.length === 0 ? (
            <p className="text-xs text-slate-500 px-5 py-4">No queries executed yet.</p>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                className="group flex items-start gap-3 px-5 py-3 border-b border-slate-800/60 hover:bg-white/5"
              >
                <div className="flex-1 min-w-0">
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap break-all font-mono leading-relaxed line-clamp-4">
                    {entry.sql}
                  </pre>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-slate-500">
                      {formatDate(entry.executedAt)}
                    </span>
                    {entry.connectionName && (
                      <span className="text-[10px] text-slate-600">
                        {entry.connectionName}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRerun(entry.sql)}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-all shrink-0 pt-0.5"
                  title="Load & run this query"
                >
                  <Play size={12} /> Run
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
