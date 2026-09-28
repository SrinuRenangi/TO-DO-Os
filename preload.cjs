// ============================================================================
// Personal OS — Electron Preload Bridge
// Secure contextBridge exposing SQLite database and desktop APIs
// ============================================================================

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sqliteDB', {
  isAvailable: true,

  // Tasks
  getTasks: () => ipcRenderer.invoke('db:tasks:get'),
  saveTask: (task) => ipcRenderer.invoke('db:tasks:save', task),
  deleteTask: (id) => ipcRenderer.invoke('db:tasks:delete', id),

  // Subtasks
  addSubtask: (subtask) => ipcRenderer.invoke('db:subtasks:add', subtask),
  toggleSubtask: (taskId, subtaskId) => ipcRenderer.invoke('db:subtasks:toggle', taskId, subtaskId),
  deleteSubtask: (taskId, subtaskId) => ipcRenderer.invoke('db:subtasks:delete', taskId, subtaskId),

  // Reminders
  getReminders: () => ipcRenderer.invoke('db:reminders:get'),
  saveReminder: (reminder) => ipcRenderer.invoke('db:reminders:save', reminder),
  deleteReminder: (id) => ipcRenderer.invoke('db:reminders:delete', id),

  // Notes
  getNotes: () => ipcRenderer.invoke('db:notes:get'),
  saveNote: (note) => ipcRenderer.invoke('db:notes:save', note),
  deleteNote: (id) => ipcRenderer.invoke('db:notes:delete', id),

  // Calendar Events (Separate from Tasks)
  getEvents: () => ipcRenderer.invoke('db:events:get'),
  saveEvent: (event) => ipcRenderer.invoke('db:events:save', event),
  deleteEvent: (id) => ipcRenderer.invoke('db:events:delete', id),

  // Timer
  getTimer: () => ipcRenderer.invoke('db:timer:get'),
  saveTimer: (timer) => ipcRenderer.invoke('db:timer:save', timer),

  // Notifications
  getNotifications: () => ipcRenderer.invoke('db:notifications:get'),
  addNotification: (notif) => ipcRenderer.invoke('db:notifications:add', notif),
  markNotificationRead: (id) => ipcRenderer.invoke('db:notifications:markRead', id),
  deleteNotification: (id) => ipcRenderer.invoke('db:notifications:delete', id),
  clearNotifications: () => ipcRenderer.invoke('db:notifications:clear'),

  // Settings
  getSettings: () => ipcRenderer.invoke('db:settings:get'),
  setSetting: (key, value) => ipcRenderer.invoke('db:settings:set', key, value),

  // Backup & Snapshot
  exportSnapshot: () => ipcRenderer.invoke('db:backup:export'),
  restoreSnapshot: (snapshot) => ipcRenderer.invoke('db:backup:import', snapshot),

  // Info
  getInfo: () => ipcRenderer.invoke('db:info'),
});

// Desktop Native Windows Notifications Bridge
contextBridge.exposeInMainWorld('desktopNotifications', {
  isAvailable: true,
  showNotification: (payload) => ipcRenderer.invoke('show-notification', payload),
  getNotificationHistory: () => ipcRenderer.invoke('notification-history'),
  onNotificationClicked: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('notification-clicked', handler);
    return () => ipcRenderer.removeListener('notification-clicked', handler);
  },
  onNotificationDismissed: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('notification-dismissed', handler);
    return () => ipcRenderer.removeListener('notification-dismissed', handler);
  },
  getAutoStart: () => ipcRenderer.invoke('app:autostart:get'),
  setAutoStart: (enable) => ipcRenderer.invoke('app:autostart:set', enable),
  onReminderAlertTriggered: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('reminder-alert-triggered', handler);
    return () => ipcRenderer.removeListener('reminder-alert-triggered', handler);
  },
  onSystemResumed: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('system-resumed', handler);
    return () => ipcRenderer.removeListener('system-resumed', handler);
  },
});

console.log('[Preload] SQLite & Desktop Notifications bridges exposed to renderer');
