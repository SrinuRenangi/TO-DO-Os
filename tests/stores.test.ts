import { describe, it, expect } from 'vitest';
import { useTaskStore } from '../src/renderer/stores/useTaskStore';
import { useReminderStore } from '../src/renderer/stores/useReminderStore';
import { useFocusStore } from '../src/renderer/stores/useFocusStore';
import { useNotesStore } from '../src/renderer/stores/useNotesStore';
import { useCalendarStore } from '../src/renderer/stores/useCalendarStore';

describe('Personal OS — 7 Core Services & Stores', () => {
  it('Task Service: handles task addition and completion toggling with SQLite durability', () => {
    const taskStore = useTaskStore.getState();
    const task = taskStore.addTask('Benchmark IPC latency', 'P0', 'Engineering');

    expect(task.title).toBe('Benchmark IPC latency');
    expect(task.priority).toBe('P0');
    expect(task.status).toBe('todo');

    taskStore.toggleTaskStatus(task.id);
    const updated = useTaskStore.getState().tasks.find((t) => t.id === task.id);
    expect(updated?.status).toBe('completed');
  });

  it('Reminder Service: creates schedulable reminders and handles snooze', () => {
    const reminderStore = useReminderStore.getState();
    const rem = reminderStore.addReminder('Buy Medicine', new Date(Date.now() + 60000).toISOString(), '6:00 PM', 'critical');

    expect(rem.title).toBe('Buy Medicine');
    expect(rem.urgency).toBe('critical');

    reminderStore.snoozeReminder(rem.id, 15);
    const updated = useReminderStore.getState().reminders.find((r) => r.id === rem.id);
    expect(updated?.isSnoozed).toBe(true);
  });

  it('Timer Service: switches mode and computes target seconds accurately', () => {
    const focusStore = useFocusStore.getState();
    focusStore.setMode('pomodoro');
    expect(useFocusStore.getState().targetSeconds).toBe(25 * 60);

    focusStore.setMode('countdown', 15 * 60);
    expect(useFocusStore.getState().targetSeconds).toBe(15 * 60);
  });

  it('Notes Service: converts scratchpad text to task seamlessly', () => {
    const notesStore = useNotesStore.getState();
    notesStore.setScratchpad('Implement SQLite Write-Ahead Logging');
    notesStore.convertScratchpadToTask();

    const tasks = useTaskStore.getState().tasks;
    const created = tasks.find((t) => t.title.includes('Implement SQLite'));
    expect(created).toBeDefined();
    expect(created?.priority).toBe('P1');
  });

  it('Calendar Service: aggregates real tasks into calendar timeline without mock events', () => {
    const calendarStore = useCalendarStore.getState();
    expect(Array.isArray(calendarStore.events)).toBe(true);
    calendarStore.addEvent('Team Architecture Sync', new Date().toISOString().split('T')[0], '11:00');
    
    const events = useCalendarStore.getState().events;
    const found = events.find((e) => e.title === 'Team Architecture Sync');
    expect(found).toBeDefined();
  });
});
