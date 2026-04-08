import { create } from 'zustand'
import api from '../api'

let tabCounter = 1

const defaultTab = () => ({
  id: tabCounter++,
  title: 'Query 1',
  sql: '-- Write your SQL here\nSELECT 1;',
})

const useStore = create((set, get) => ({
  // -------------------------------------------------------------------------
  // Connections
  // -------------------------------------------------------------------------
  connections: [],
  activeConnectionId: null,

  addConnection: (conn) =>
    set((s) => ({ connections: [...s.connections, conn] })),

  removeConnection: (id) =>
    set((s) => ({
      connections: s.connections.filter((c) => c.id !== id),
      activeConnectionId:
        s.activeConnectionId === id ? null : s.activeConnectionId,
    })),

  setActiveConnection: (id) => set({ activeConnectionId: id }),

  getActiveConnection: () => {
    const { connections, activeConnectionId } = get()
    return connections.find((c) => c.id === activeConnectionId) || null
  },

  // -------------------------------------------------------------------------
  // Tabs / Editor
  // -------------------------------------------------------------------------
  tabs: [defaultTab()],
  activeTabId: 1,

  addTab: () => {
    const tab = defaultTab()
    tab.title = `Query ${tab.id}`
    set((s) => ({ tabs: [...s.tabs, tab], activeTabId: tab.id }))
  },

  closeTab: (id) =>
    set((s) => {
      const remaining = s.tabs.filter((t) => t.id !== id)
      if (remaining.length === 0) {
        const newTab = defaultTab()
        return { tabs: [newTab], activeTabId: newTab.id }
      }
      const activeId =
        s.activeTabId === id ? remaining[remaining.length - 1].id : s.activeTabId
      return { tabs: remaining, activeTabId: activeId }
    }),

  setActiveTab: (id) => set({ activeTabId: id }),

  updateTabSql: (id, sql) =>
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, sql } : t)),
    })),

  getActiveTab: () => {
    const { tabs, activeTabId } = get()
    return tabs.find((t) => t.id === activeTabId) || tabs[0]
  },

  // -------------------------------------------------------------------------
  // Query execution
  // -------------------------------------------------------------------------
  isExecuting: false,
  results: null,    // { columns: [], rows: [], executionTime: number }
  queryError: null,

  executeQuery: async () => {
    const { getActiveConnection, getActiveTab } = get()
    const conn = getActiveConnection()
    const tab = getActiveTab()

    if (!conn) {
      set({ queryError: 'No active connection. Please connect to a database first.' })
      return
    }

    if (!tab?.sql?.trim()) {
      set({ queryError: 'Query is empty.' })
      return
    }

    set({ isExecuting: true, results: null, queryError: null })

    try {
      const response = await api.post('/query/execute', {
        connection_id: conn.id,
        sql: tab.sql,
      })
      set({ results: response.data, isExecuting: false })

      // Add to history
      get().addHistory({ sql: tab.sql, connectionId: conn.id, connectionName: conn.name })
    } catch (err) {
      const msg =
        err.response?.data?.detail || err.message || 'Query execution failed.'
      set({ queryError: msg, isExecuting: false })
    }
  },

  // -------------------------------------------------------------------------
  // Schema
  // -------------------------------------------------------------------------
  schema: [],
  isLoadingSchema: false,

  loadSchema: async () => {
    const { getActiveConnection } = get()
    const conn = getActiveConnection()
    if (!conn) return

    set({ isLoadingSchema: true })
    try {
      const response = await api.get(`/schema/${conn.id}`)
      set({ schema: response.data, isLoadingSchema: false })
    } catch (err) {
      console.error('Schema load failed:', err)
      set({ isLoadingSchema: false })
    }
  },

  // -------------------------------------------------------------------------
  // Query history
  // -------------------------------------------------------------------------
  history: [],

  addHistory: (entry) =>
    set((s) => ({
      history: [
        { ...entry, id: Date.now(), executedAt: new Date().toISOString() },
        ...s.history.slice(0, 99), // keep last 100 entries
      ],
    })),

  clearHistory: () => set({ history: [] }),

  // -------------------------------------------------------------------------
  // UI state
  // -------------------------------------------------------------------------
  showConnectionModal: false,
  setShowConnectionModal: (v) => set({ showConnectionModal: v }),

  showHistory: false,
  setShowHistory: (v) => set({ showHistory: v }),
}))

export default useStore
