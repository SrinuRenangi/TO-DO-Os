import { describe, it, expect, vi, beforeEach } from 'vitest';
import { databaseService } from '../src/services/database/database-service';
import { taskService } from '../src/services/tasks/task-service';
import { reminderService } from '../src/services/reminders/reminder-service';
import { schedulerService } from '../src/services/scheduler/scheduler-service';
import { timerService } from '../src/services/timer/timer-service';
import { notesService } from '../src/services/notes/notes-service';
import { calendarService } from '../src/services/calendar/calendar-service';
import { notificationService } from '../src/services/notifications/notification-service';
import { settingsService } from '../src/services/settings/settings-service';

describe('Personal OS — Core Services Integration Suite', () => {
  beforeEach(() => {
    // Clean slate test state
  });

  // ----------------------------------------------------
  // Phase 1: Database Service & Snapshot
  // ----------------------------------------------------
  it('Phase 1 (Database Service): supports CRUD and full snapshot backup & restore', () => {
    const snapshot = databaseService.exportSnapshot();
    expect(snapshot.version).toBeDefined();
    expect(Array.isArray(snapshot.tasks)).toBe(true);
    expect(Array.isArray(snapshot.reminders)).toBe(true);
    expect(Array.isArray(snapshot.notes)).toBe(true);
    expect(snapshot.timer).toBeDefined();

    // Verify snapshot import restore
    const restored = databaseService.restoreSnapshot(snapshot);
    expect(restored).toBe(true);
  });

  // ----------------------------------------------------
  // Phase 2: Task Service
  // ----------------------------------------------------
  it('Phase 2 (Task Service): full CRUD, recurring generation, and auto-reminder linking', () => {
    // 1. Create task with due time "18:00" (Buy Medicine)
    const task = taskService.createTask({
      title: 'Buy Medicine & Prescription Refill',
      description: 'Critical pharmacy pickup',
      priority: 'P0',
      dueDate: '2026-09-26',
      dueTime: '18:00',
      recurring: 'daily',
    });

    expect(task.id).toBeDefined();
    expect(task.title).toBe('Buy Medicine & Prescription Refill');
    expect(task.priority).toBe('P0');
    expect(task.recurring).toBe('daily');

    // Verify automatic reminder was scheduled for this task!
    const reminders = reminderService.getAllReminders();
    const linkedReminder = reminders.find((r) => r.taskId === task.id);
    expect(linkedReminder).toBeDefined();
    expect(linkedReminder?.urgency).toBe('critical');

    // 2. Add subtasks
    const sub = taskService.addSubtask(task.id, 'Check prescription');
    expect(sub).toBeDefined();
    expect(sub?.completed).toBe(false);

    taskService.toggleSubtask(task.id, sub!.id);
    const updatedTask = taskService.getTaskById(task.id);
    expect(updatedTask?.subtasks[0].completed).toBe(true);

    // 3. Complete task -> triggers recurring generation
    const completed = taskService.toggleTaskComplete(task.id);
    expect(completed?.status).toBe('completed');

    // Next recurrence should exist in task list
    const allTasks = taskService.getAllTasks();
    const nextRecurrence = allTasks.find(
      (t) => t.title === 'Buy Medicine & Prescription Refill' && t.status === 'todo'
    );
    expect(nextRecurrence).toBeDefined();
  });

  // ----------------------------------------------------
  // Phase 3 & 4: Reminder Service & Background Scheduler
  // ----------------------------------------------------
  it('Phase 3 & 4 (Reminder & Scheduler): triggers due reminders and supports snooze', () => {
    // Create an immediate due reminder (in past or right now)
    const pastTime = new Date(Date.now() - 5000).toISOString();
    const rem = reminderService.createReminder({
      title: 'Immediate Medication Alert',
      triggerTime: pastTime,
      dueTimeFormatted: 'Immediate',
      urgency: 'critical',
    });

    expect(rem.isTriggered).toBe(false);

    // Scheduler tick reconciles and triggers
    const triggered = reminderService.checkAndTriggerDueReminders();
    const found = triggered.find((r) => r.id === rem.id);
    expect(found).toBeDefined();
    expect(found?.isTriggered).toBe(true);

    // Snooze by 15 mins
    const snoozed = reminderService.snoozeReminder(rem.id, 15);
    expect(snoozed?.isSnoozed).toBe(true);
    expect(snoozed?.isTriggered).toBe(false);
  });

  // ----------------------------------------------------
  // Phase 5: Notification Service
  // ----------------------------------------------------
  it('Phase 5 (Notification Service): logs notifications to persistent database feed', () => {
    notificationService.dispatch({
      title: 'Windows Native Alert',
      body: 'Testing notification history feed',
      urgency: 'normal',
      sound: false,
    });

    const notifs = databaseService.getNotifications();
    const found = notifs.find((n) => n.title === 'Windows Native Alert');
    expect(found).toBeDefined();
    expect(found?.body).toBe('Testing notification history feed');
  });

  // ----------------------------------------------------
  // Phase 7: Calendar Service
  // ----------------------------------------------------
  it('Phase 7 (Calendar Service): displays real tasks and reminders across timeline', () => {
    // Create real task
    taskService.createTask({
      title: 'Executive Calendar Event',
      dueDate: '2026-09-30',
      dueTime: '14:00',
      priority: 'P1',
    });

    const items = calendarService.getUnifiedItems();
    const calItem = items.find((i) => i.title === 'Executive Calendar Event');
    expect(calItem).toBeDefined();
    expect(calItem?.date).toBe('2026-09-30');
    expect(calItem?.time).toBe('14:00');
    expect(calItem?.sourceType).toBe('task');
  });

  // ----------------------------------------------------
  // Phase 8: Timer Service
  // ----------------------------------------------------
  it('Phase 8 (Timer Service): wall-clock accurate background timing', () => {
    timerService.setMode('pomodoro');
    const timer = timerService.getTimer();
    expect(timer.mode).toBe('pomodoro');
    expect(timer.targetSeconds).toBe(25 * 60);

    timerService.start();
    expect(timerService.getTimer().isRunning).toBe(true);

    timerService.pause();
    expect(timerService.getTimer().isRunning).toBe(false);

    timerService.reset();
    expect(timerService.getTimer().remainingSeconds).toBe(25 * 60);
  });

  // ----------------------------------------------------
  // Phase 9: Notes Service
  // ----------------------------------------------------
  it('Phase 9 (Notes Service): supports CRUD, search, pin, and markdown', () => {
    const note = notesService.createNote({
      title: 'Linux Desktop Principles',
      content: '# Reliability\n- Pure deterministic logic\n- Zero AI',
      folder: 'Architecture',
    });

    expect(note.title).toBe('Linux Desktop Principles');
    expect(note.pinned).toBe(false);

    notesService.togglePin(note.id);
    const pinned = notesService.getNoteById(note.id);
    expect(pinned?.pinned).toBe(true);

    // Search
    const searchResults = notesService.searchNotes('deterministic');
    expect(searchResults.some((n) => n.id === note.id)).toBe(true);

    // Delete
    const deleted = notesService.deleteNote(note.id);
    expect(deleted).toBe(true);
    expect(notesService.getNoteById(note.id)).toBeUndefined();
  });

  // ----------------------------------------------------
  // Settings Service
  // ----------------------------------------------------
  it('Settings Service: autoStart, closeToTray, and backup export', () => {
    settingsService.updateSetting('autoStart', true);
    settingsService.updateSetting('closeToTray', true);
    const settings = settingsService.getSettings();
    expect(settings.autoStart).toBe(true);
    expect(settings.closeToTray).toBe(true);

    const json = settingsService.exportBackup();
    expect(typeof json).toBe('string');
    expect(json.includes('version')).toBe(true);
  });
});
