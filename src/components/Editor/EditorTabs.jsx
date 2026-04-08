import { Plus, X } from 'lucide-react'
import useStore from '../../store'

export default function EditorTabs() {
  const { tabs, activeTabId, addTab, closeTab, setActiveTab } = useStore()

  return (
    <div className="flex items-end gap-0 bg-[#172033] border-b border-slate-700/60 overflow-x-auto shrink-0">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 cursor-pointer border-t-2 text-xs shrink-0 group transition-colors ${
            tab.id === activeTabId
              ? 'border-blue-500 bg-[#0f172a] text-slate-200'
              : 'border-transparent bg-[#172033] text-slate-400 hover:text-slate-200 hover:bg-[#1a2740]'
          }`}
        >
          <span className="max-w-[120px] truncate">{tab.title}</span>
          {tabs.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                closeTab(tab.id)
              }}
              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity"
            >
              <X size={11} />
            </button>
          )}
        </div>
      ))}

      <button
        onClick={addTab}
        className="flex items-center px-3 py-2 text-slate-500 hover:text-slate-200 transition-colors shrink-0"
        title="New tab"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}
