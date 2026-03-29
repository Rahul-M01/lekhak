import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // Todos
  todos: {
    getAll: () => ipcRenderer.invoke('todos:getAll'),
    create: (data: any) => ipcRenderer.invoke('todos:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('todos:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('todos:delete', id),
    toggle: (id: number) => ipcRenderer.invoke('todos:toggle', id),
  },
  // Notes
  notes: {
    getAll: () => ipcRenderer.invoke('notes:getAll'),
    create: (data: any) => ipcRenderer.invoke('notes:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('notes:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('notes:delete', id),
    togglePin: (id: number) => ipcRenderer.invoke('notes:togglePin', id),
  },
  // Reminders
  reminders: {
    getAll: () => ipcRenderer.invoke('reminders:getAll'),
    create: (data: any) => ipcRenderer.invoke('reminders:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('reminders:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('reminders:delete', id),
    complete: (id: number) => ipcRenderer.invoke('reminders:complete', id),
  },
  // Window controls
  window: {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
  }
}

contextBridge.exposeInMainWorld('api', api)
