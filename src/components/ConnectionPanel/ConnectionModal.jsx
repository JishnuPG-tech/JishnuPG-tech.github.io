import { useState } from 'react'
import { X, Database, Eye, EyeOff } from 'lucide-react'
import useStore from '../../store'
import api from '../../api'

const DB_TYPES = ['sqlite', 'postgresql', 'mysql']

const defaultForm = {
  name: '',
  type: 'sqlite',
  host: 'localhost',
  port: '5432',
  database: '',
  username: '',
  password: '',
}

const portDefaults = { postgresql: '5432', mysql: '3306', sqlite: '' }

export default function ConnectionModal() {
  const { setShowConnectionModal, addConnection, setActiveConnection, loadSchema } = useStore()
  const [form, setForm] = useState(defaultForm)
  const [showPassword, setShowPassword] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [error, setError] = useState(null)

  const handleChange = (field) => (e) => {
    const value = e.target.value
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'type') {
        next.port = portDefaults[value] || ''
      }
      return next
    })
    setTestResult(null)
    setError(null)
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    setError(null)
    try {
      await api.post('/connections/test', form)
      setTestResult('Connection successful!')
    } catch (err) {
      setError(err.response?.data?.detail || 'Connection failed.')
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Connection name is required.')
      return
    }
    setError(null)
    try {
      const response = await api.post('/connections', form)
      const saved = response.data
      addConnection(saved)
      setActiveConnection(saved.id)
      loadSchema()
      setShowConnectionModal(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save connection.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1e293b] border border-slate-700 rounded-lg w-[480px] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2 text-slate-200 font-medium">
            <Database size={16} className="text-blue-400" />
            New Connection
          </div>
          <button onClick={() => setShowConnectionModal(false)} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          <Field label="Connection Name">
            <input
              value={form.name}
              onChange={handleChange('name')}
              placeholder="My Database"
              className={inputCls}
            />
          </Field>

          <Field label="Database Type">
            <select value={form.type} onChange={handleChange('type')} className={inputCls}>
              {DB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </Field>

          {form.type !== 'sqlite' ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Field label="Host">
                    <input value={form.host} onChange={handleChange('host')} className={inputCls} />
                  </Field>
                </div>
                <Field label="Port">
                  <input value={form.port} onChange={handleChange('port')} className={inputCls} />
                </Field>
              </div>

              <Field label="Database Name">
                <input value={form.database} onChange={handleChange('database')} className={inputCls} />
              </Field>

              <Field label="Username">
                <input value={form.username} onChange={handleChange('username')} className={inputCls} />
              </Field>

              <Field label="Password">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange('password')}
                    className={`${inputCls} pr-9`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </Field>
            </>
          ) : (
            <Field label="Database File Path">
              <input
                value={form.database}
                onChange={handleChange('database')}
                placeholder="/path/to/database.db  (leave empty for in-memory)"
                className={inputCls}
              />
            </Field>
          )}

          {/* Feedback */}
          {testResult && (
            <p className="text-green-400 text-xs">{testResult}</p>
          )}
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-700">
          <button
            onClick={() => setShowConnectionModal(false)}
            className="px-4 py-1.5 text-xs text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleTest}
            disabled={testing}
            className="px-4 py-1.5 text-xs text-slate-300 hover:text-white border border-slate-600 hover:border-blue-500 rounded transition-colors disabled:opacity-50"
          >
            {testing ? 'Testing…' : 'Test'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full bg-[#0f172a] border border-slate-600 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder:text-slate-500'
