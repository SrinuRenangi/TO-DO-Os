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
  runtime: {
    getStatus: () => ipcRenderer.invoke('runtime:get-status'),
    toggleAutoStart: () => ipcRenderer.invoke('runtime:toggle-autostart'),
    isAutoStartEnabled: () => ipcRenderer.invoke('runtime:is-autostart-enabled'),
    scheduleJob: (job: any) => ipcRenderer.invoke('runtime:schedule-job', job),
    triggerNotification: (payload: any) => ipcRenderer.invoke('runtime:trigger-notification', payload),
    reconcileMissed: () => ipcRenderer.invoke('runtime:reconcile-missed'),
  },
  on: (channel: string, listener: (...args: any[]) => void) => {
    const subscription = (_event: any, ...args: any[]) => listener(...args);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  },
});
