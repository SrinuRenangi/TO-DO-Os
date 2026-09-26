import { contextBridge, ipcRenderer } from 'electron';

// Expose safe, protected APIs to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  db: {
    getTasks: (filter?: any) => ipcRenderer.invoke('db:tasks:get', filter),
    createTask: (data: any) => ipcRenderer.invoke('db:tasks:create', data),
    updateTask: (id: string, updates: any) => ipcRenderer.invoke('db:tasks:update', id, updates),
    deleteTask: (id: string) => ipcRenderer.invoke('db:tasks:delete', id),
    getHabits: () => ipcRenderer.invoke('db:habits:get'),
    toggleHabitToday: (id: string, date: string) => ipcRenderer.invoke('db:habits:toggle', id, date),
    getEvents: (start: string, end: string) => ipcRenderer.invoke('db:events:get', start, end),
  },
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
  },
  system: {
    getSystemInfo: () => ipcRenderer.invoke('system:info'),
  },
});
