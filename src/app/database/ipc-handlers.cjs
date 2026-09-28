// ============================================================================
// Personal OS — SQLite IPC Handlers
// Direct Main-Process IPC Bridge for better-sqlite3 WAL operations
// ============================================================================

const { ipcMain } = require('electron');
const { databaseManager } = require('./database-manager.cjs');

function registerDatabaseIpcHandlers() {
  // Tasks
  ipcMain.handle('db:tasks:get', async () => {
    return databaseManager.getTasks();
  });

  ipcMain.handle('db:tasks:save', async (_event, task) => {
    return databaseManager.saveTask(task);
  });

  ipcMain.handle('db:tasks:delete', async (_event, id) => {
    return databaseManager.deleteTask(id);
  });

  // Subtasks
  ipcMain.handle('db:subtasks:add', async (_event, subtask) => {
    return databaseManager.addSubtask(subtask);
  });

  ipcMain.handle('db:subtasks:toggle', async (_event, taskId, subtaskId) => {
    return databaseManager.toggleSubtask(taskId, subtaskId);
  });

  ipcMain.handle('db:subtasks:delete', async (_event, taskId, subtaskId) => {
    return databaseManager.deleteSubtask(taskId, subtaskId);
  });

  // Reminders
  ipcMain.handle('db:reminders:get', async () => {
    return databaseManager.getReminders();
  });

  ipcMain.handle('db:reminders:save', async (_event, reminder) => {
    return databaseManager.saveReminder(reminder);
  });

  ipcMain.handle('db:reminders:delete', async (_event, id) => {
    return databaseManager.deleteReminder(id);
  });

  // Notes
  ipcMain.handle('db:notes:get', async () => {
    return databaseManager.getNotes();
  });

  ipcMain.handle('db:notes:save', async (_event, note) => {
    return databaseManager.saveNote(note);
  });

  ipcMain.handle('db:notes:delete', async (_event, id) => {
    return databaseManager.deleteNote(id);
  });

  // Calendar Events (Separate from Tasks)
  ipcMain.handle('db:events:get', async () => {
    return databaseManager.getEvents();
  });

  ipcMain.handle('db:events:save', async (_event, event) => {
    return databaseManager.saveEvent(event);
  });

  ipcMain.handle('db:events:delete', async (_event, id) => {
    return databaseManager.deleteEvent(id);
  });

  // Timer
  ipcMain.handle('db:timer:get', async () => {
    return databaseManager.getTimer();
  });

  ipcMain.handle('db:timer:save', async (_event, timer) => {
    return databaseManager.saveTimer(timer);
  });

  // Notifications
  ipcMain.handle('db:notifications:get', async () => {
    return databaseManager.getNotifications();
  });

  ipcMain.handle('db:notifications:add', async (_event, notif) => {
    databaseManager.addNotification(notif);
    return true;
  });

  ipcMain.handle('db:notifications:markRead', async (_event, id) => {
    databaseManager.markNotificationRead(id);
    return true;
  });

  ipcMain.handle('db:notifications:delete', async (_event, id) => {
    databaseManager.deleteNotification(id);
    return true;
  });

  ipcMain.handle('db:notifications:clear', async () => {
    databaseManager.clearNotifications();
    return true;
  });

  // Settings
  ipcMain.handle('db:settings:get', async () => {
    return databaseManager.getSettings();
  });

  ipcMain.handle('db:settings:set', async (_event, key, value) => {
    databaseManager.setSetting(key, value);
    return true;
  });

  // Backup & Restore
  ipcMain.handle('db:backup:export', async () => {
    return databaseManager.exportSnapshot();
  });

  ipcMain.handle('db:backup:import', async (_event, snapshot) => {
    return databaseManager.restoreSnapshot(snapshot);
  });

  // Info
  ipcMain.handle('db:info', async () => {
    return {
      type: 'better-sqlite3',
      journalMode: 'wal',
      path: databaseManager.getDbPath(),
    };
  });

  console.log('[DatabaseIPC] Registered 24 SQLite IPC handlers for main process.');
}

module.exports = { registerDatabaseIpcHandlers };
