import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import Toolbar from './components/Toolbar/Toolbar'
import SchemaExplorer from './components/SchemaExplorer/SchemaExplorer'
import SQLEditor from './components/Editor/SQLEditor'
import EditorTabs from './components/Editor/EditorTabs'
import ResultsPanel from './components/Results/ResultsPanel'
import QueryHistory from './components/QueryHistory/QueryHistory'
import ConnectionModal from './components/ConnectionPanel/ConnectionModal'
import useStore from './store'

export default function App() {
  const { showConnectionModal, showHistory } = useStore()

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-slate-200 select-none">
      {/* Top toolbar */}
      <Toolbar />

      {/* Main layout */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          {/* Sidebar – Schema Explorer */}
          <Panel defaultSize={18} minSize={12} maxSize={35}>
            <SchemaExplorer />
          </Panel>

          <PanelResizeHandle className="w-[3px] bg-slate-800 hover:bg-blue-500 transition-colors cursor-col-resize" />

          {/* Center – Editor + Results */}
          <Panel defaultSize={82}>
            <PanelGroup direction="vertical" className="h-full">
              {/* Editor area */}
              <Panel defaultSize={55} minSize={25}>
                <div className="flex flex-col h-full">
                  <EditorTabs />
                  <div className="flex-1 overflow-hidden">
                    <SQLEditor />
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="h-[3px] bg-slate-800 hover:bg-blue-500 transition-colors cursor-row-resize" />

              {/* Results area */}
              <Panel defaultSize={45} minSize={20}>
                <ResultsPanel />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>

      {/* Modals */}
      {showConnectionModal && <ConnectionModal />}
      {showHistory && <QueryHistory />}
    </div>
  )
}
