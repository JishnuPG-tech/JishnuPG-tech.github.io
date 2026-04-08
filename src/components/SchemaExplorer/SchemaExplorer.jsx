import { useState } from 'react'
import { Database, Table, Columns, ChevronRight, ChevronDown, RefreshCw, Loader } from 'lucide-react'
import useStore from '../../store'

export default function SchemaExplorer() {
  const { schema, isLoadingSchema, loadSchema, activeConnectionId } = useStore()
  const [expanded, setExpanded] = useState({})

  const toggle = (key) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="flex flex-col h-full bg-[#172033] border-r border-slate-700/60">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/60 shrink-0">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Schema
        </span>
        <button
          onClick={loadSchema}
          disabled={!activeConnectionId || isLoadingSchema}
          className="text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
          title="Refresh schema"
        >
          {isLoadingSchema ? (
            <Loader size={13} className="animate-spin" />
          ) : (
            <RefreshCw size={13} />
          )}
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {!activeConnectionId ? (
          <p className="text-xs text-slate-500 px-4 py-3">
            Connect to a database to browse its schema.
          </p>
        ) : schema.length === 0 && !isLoadingSchema ? (
          <p className="text-xs text-slate-500 px-4 py-3">No schema loaded.</p>
        ) : (
          schema.map((db) => (
            <DatabaseNode
              key={db.name}
              db={db}
              expanded={expanded}
              toggle={toggle}
            />
          ))
        )}
      </div>
    </div>
  )
}

function DatabaseNode({ db, expanded, toggle }) {
  const dbKey = `db:${db.name}`
  const isOpen = expanded[dbKey]

  return (
    <div>
      <div
        className="flex items-center gap-1.5 px-3 py-1 cursor-pointer hover:bg-white/5 group"
        onClick={() => toggle(dbKey)}
      >
        {isOpen ? (
          <ChevronDown size={12} className="text-slate-500" />
        ) : (
          <ChevronRight size={12} className="text-slate-500" />
        )}
        <Database size={13} className="text-blue-400 shrink-0" />
        <span className="text-xs text-slate-200 truncate">{db.name}</span>
      </div>

      {isOpen &&
        db.tables.map((table) => (
          <TableNode
            key={`${db.name}.${table.name}`}
            dbName={db.name}
            table={table}
            expanded={expanded}
            toggle={toggle}
          />
        ))}
    </div>
  )
}

function TableNode({ dbName, table, expanded, toggle }) {
  const tableKey = `table:${dbName}.${table.name}`
  const isOpen = expanded[tableKey]

  return (
    <div>
      <div
        className="flex items-center gap-1.5 pl-7 pr-3 py-1 cursor-pointer hover:bg-white/5"
        onClick={() => toggle(tableKey)}
      >
        {isOpen ? (
          <ChevronDown size={12} className="text-slate-500" />
        ) : (
          <ChevronRight size={12} className="text-slate-500" />
        )}
        <Table size={13} className="text-emerald-400 shrink-0" />
        <span className="text-xs text-slate-300 truncate">{table.name}</span>
      </div>

      {isOpen &&
        table.columns.map((col) => (
          <div
            key={col.name}
            className="flex items-center justify-between pl-14 pr-3 py-0.5 hover:bg-white/5"
          >
            <div className="flex items-center gap-1.5">
              <Columns size={11} className="text-slate-500 shrink-0" />
              <span className="text-xs text-slate-400">{col.name}</span>
            </div>
            <span className="text-[10px] text-slate-600 font-mono">{col.type}</span>
          </div>
        ))}
    </div>
  )
}
