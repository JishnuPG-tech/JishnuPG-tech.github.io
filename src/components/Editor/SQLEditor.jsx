import Editor from '@monaco-editor/react'
import useStore from '../../store'

const EDITOR_OPTIONS = {
  fontSize: 13,
  fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
  fontLigatures: true,
  minimap: { enabled: false },
  lineNumbers: 'on',
  wordWrap: 'on',
  scrollBeyondLastLine: false,
  renderLineHighlight: 'line',
  padding: { top: 12, bottom: 12 },
  smoothScrolling: true,
  cursorBlinking: 'smooth',
  suggestOnTriggerCharacters: true,
  quickSuggestions: { other: true, comments: false, strings: false },
  folding: true,
  glyphMargin: false,
}

export default function SQLEditor() {
  const { getActiveTab, updateTabSql, executeQuery } = useStore()
  const tab = getActiveTab()

  const handleEditorMount = (editor, monaco) => {
    // Ctrl+Enter / Cmd+Enter → run query
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      executeQuery()
    })

    // Register SQL keywords for basic auto-complete
    monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (model, position) => {
        const keywords = [
          'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE',
          'SET', 'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'ADD',
          'COLUMN', 'INDEX', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER',
          'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
          'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
          'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS NULL',
          'IS NOT NULL', 'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES',
          'BEGIN', 'COMMIT', 'ROLLBACK', 'TRANSACTION',
        ]
        const suggestions = keywords.map((kw) => ({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
        }))
        return { suggestions }
      },
    })
  }

  if (!tab) return null

  return (
    <div className="h-full bg-[#0f172a]">
      <Editor
        key={tab.id}
        height="100%"
        language="sql"
        value={tab.sql}
        theme="vs-dark"
        options={EDITOR_OPTIONS}
        onChange={(value) => updateTabSql(tab.id, value ?? '')}
        onMount={handleEditorMount}
      />
    </div>
  )
}
