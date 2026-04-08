const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const fs = require('fs')

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

let mainWindow
let backendProcess

// ---------------------------------------------------------------------------
// Backend management
// ---------------------------------------------------------------------------

function startBackend() {
  const backendPath = isDev
    ? path.join(__dirname, '..', 'backend', 'main.py')
    : path.join(process.resourcesPath, 'backend', 'main.py')

  if (!fs.existsSync(backendPath)) {
    console.error('Backend not found at', backendPath)
    return
  }

  backendProcess = spawn('python', [backendPath], {
    stdio: 'inherit',
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
  })

  backendProcess.on('error', (err) => {
    console.error('Failed to start backend process:', err)
  })

  backendProcess.on('exit', (code) => {
    console.log('Backend exited with code', code)
  })
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.kill()
    backendProcess = null
  }
}

// ---------------------------------------------------------------------------
// Window management
// ---------------------------------------------------------------------------

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0f172a',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0f172a',
      symbolColor: '#94a3b8',
      height: 32,
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// ---------------------------------------------------------------------------
// IPC handlers
// ---------------------------------------------------------------------------

// Open a save dialog and write file content (used for CSV/Excel export)
ipcMain.handle('dialog:saveFile', async (_event, { filename, content }) => {
  const { dialog } = require('electron')
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: filename,
    filters: [
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'Excel Files', extensions: ['xlsx'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  })

  if (result.canceled || !result.filePath) return { success: false }

  try {
    fs.writeFileSync(result.filePath, content, 'utf-8')
    return { success: true, path: result.filePath }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

// ---------------------------------------------------------------------------
// App lifecycle
// ---------------------------------------------------------------------------

app.whenReady().then(() => {
  startBackend()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  stopBackend()
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', stopBackend)
