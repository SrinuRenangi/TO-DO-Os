import { describe, it, expect } from 'vitest';
import { useNotesStore } from '../src/renderer/stores/useNotesStore';
import { useReminderStore } from '../src/renderer/stores/useReminderStore';
import { useTaskStore } from '../src/renderer/stores/useTaskStore';
import { useAppStore, MODULE_REGISTRY } from '../src/renderer/stores/useAppStore';

describe('Deterministic Productivity System (Zero-AI & 7 Core Modules Mandate)', () => {
  it('enforces exactly 7 core modules and zero AI components in app registry', () => {
    const modules = MODULE_REGISTRY.map((m) => m.id);
    expect(modules).toEqual([
      'dashboard',
      'tasks',
      'calendar',
      'reminders',
      'notes',
      'timer',
      'settings',
    ]);

    expect(modules).not.toContain('ai');
    expect(modules).not.toContain('habits');
    expect(modules).not.toContain('goals');
    expect(modules).not.toContain('analytics');

    const names = MODULE_REGISTRY.map((m) => m.name.toLowerCase());
    expect(names.some((n) => n.includes('ai') || n.includes('bot') || n.includes('chat'))).toBe(false);
  });

  it('manages rich notes with folder assignment and template insertion', () => {
    const notesStore = useNotesStore.getState();
    const note = notesStore.createNote('Test Note', 'Initial text', 'Architecture');

    expect(note.folder).toBe('Architecture');

    // Apply RFC template
    notesStore.applyTemplate(note.id, 'tpl-rfc');
    const updated = useNotesStore.getState().notes.find((n) => n.id === note.id);
    expect(updated?.title).toBe('Architecture RFC');
    expect(updated?.content).toContain('Proposed Design');
  });

  it('manages reminders with snooze escalation and time adjustments', () => {
    const reminderStore = useReminderStore.getState();
    const reminder = reminderStore.addReminder(
      'Buy Medicine & Prescription Refill',
      new Date().toISOString(),
      '6:00 PM',
      'critical'
    );

    expect(reminder.urgency).toBe('critical');
    expect(reminder.isSnoozed).toBe(false);

    // Snooze 15m
    reminderStore.snoozeReminder(reminder.id, 15);
    const snoozed = useReminderStore.getState().reminders.find((r) => r.id === reminder.id);
    expect(snoozed?.isSnoozed).toBe(true);
    expect(snoozed?.dueTimeFormatted).toContain('+15m');
  });

  it('supports categories, due dates, due times, and recurring patterns in tasks', () => {
    const taskStore = useTaskStore.getState();
    const task = taskStore.addTask(
      'Kernel Telemetry Benchmark',
      'P0',
      'Engineering',
      '2026-09-26',
      '18:00',
      'daily',
      ['#kernel']
    );

    expect(task.category).toBe('Engineering');
    expect(task.dueTime).toBe('18:00');
    expect(task.priority).toBe('P0');
    expect(task.recurring).toBe('daily');
  });
});
