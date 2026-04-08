import { Database, Play, History, Plus, ChevronDown } from 'lucide-react'
import useStore from '../../store'

export default function Toolbar() {
  const {
    connections,
    activeConnectionId,
    setActiveConnection,
    setShowConnectionModal,
    setShowHistory,
    showHistory,
    executeQuery,
    isExecuting,
    loadSchema,
  } = useStore()

  const activeConn = connections.find((c) => c.id === activeConnectionId)

  const handleConnectionChange = (e) => {
    const id = e.target.value ? parseInt(e.target.value, 10) : null
    setActiveConnection(id)
    if (id) loadSchema()
  }

  const handleRun = () => {
    executeQuery()
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-[#172033] border-b border-slate-700/60 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm mr-2">
        <Database size={18} />
        <span>SQL IDE</span>
      </div>

      <div className="h-5 w-px bg-slate-700" />

      {/* Connection selector */}
      <div className="relative flex items-center gap-2">
        <label className="text-slate-400 text-xs whitespace-nowrap">Connection:</label>
        <div className="relative">
          <select
            value={activeConnectionId ?? ''}
            onChange={handleConnectionChange}
            className="appearance-none bg-[#1e293b] border border-slate-600 rounded px-3 py-1 pr-8 text-xs text-slate-200 cursor-pointer focus:outline-none focus:border-blue-500 min-w-[180px]"
          >
            <option value="">— No connection —</option>
            {connections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Add connection */}
      <button
        onClick={() => setShowConnectionModal(true)}
        className="flex items-center gap-1 bg-[#1e293b] border border-slate-600 hover:border-blue-500 text-slate-300 hover:text-white rounded px-3 py-1 text-xs transition-colors"
        title="New connection"
      >
        <Plus size={13} />
        <span>New</span>
      </button>

      <div className="h-5 w-px bg-slate-700" />

      {/* Run button */}
      <button
        onClick={handleRun}
        disabled={isExecuting}
        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded px-4 py-1 text-xs font-medium transition-colors"
        title="Run query (Ctrl+Enter)"
      >
        <Play size={13} />
        <span>{isExecuting ? 'Running…' : 'Run'}</span>
      </button>

      <div className="flex-1" />

      {/* History toggle */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className={`flex items-center gap-1.5 border rounded px-3 py-1 text-xs transition-colors ${
          showHistory
            ? 'bg-blue-600/20 border-blue-500 text-blue-400'
            : 'bg-[#1e293b] border-slate-600 hover:border-blue-500 text-slate-300 hover:text-white'
        }`}
        title="Query history"
      >
        <History size={13} />
        <span>History</span>
      </button>

      {/* Status indicator */}
      {activeConn && (
        <div className="flex items-center gap-1.5 text-xs text-green-400">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>{activeConn.name}</span>
        </div>
      )}
    </div>
  )
}
