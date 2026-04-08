const { contextBridge, ipcRenderer } = require('electron')

// Expose a minimal, safe API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options),
})
