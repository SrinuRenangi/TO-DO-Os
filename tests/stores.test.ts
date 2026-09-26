import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from '../src/renderer/stores/useTaskStore';
import { useHabitStore } from '../src/renderer/stores/useHabitStore';
import { useFocusStore } from '../src/renderer/stores/useFocusStore';
import { useNotesStore } from '../src/renderer/stores/useNotesStore';
import { getTodayDateString } from '../src/renderer/lib/utils';

describe('Zustand Reactive Store Slices', () => {
  beforeEach(() => {
    // Reset stores to predictable baseline
  });

  it('handles task addition and completion toggling', () => {
    const taskStore = useTaskStore.getState();
    const task = taskStore.addTask('Benchmark IPC latency', 'P0', ['#perf'], 45);

    expect(task.title).toBe('Benchmark IPC latency');
    expect(task.priority).toBe('P0');
    expect(task.status).toBe('todo');

    taskStore.toggleTaskStatus(task.id);
    const updated = useTaskStore.getState().tasks.find((t) => t.id === task.id);
    expect(updated?.status).toBe('completed');
  });

  it('increments habit streak on completion today', () => {
    const habitStore = useHabitStore.getState();
    const habits = habitStore.habits;
    const testHabit = habits[2]; // Uncompleted habit
    const initialStreak = testHabit.currentStreak;

    habitStore.toggleHabitToday(testHabit.id);
    const after = useHabitStore.getState().habits.find((h) => h.id === testHabit.id);
    expect(after?.currentStreak).toBe(initialStreak + 1);
    expect(after?.completedDates).toContain(getTodayDateString());
  });

  it('switches focus mode and updates target minutes correctly', () => {
    const focusStore = useFocusStore.getState();
    focusStore.setMode('pomodoro');
    expect(useFocusStore.getState().targetMinutes).toBe(25);
    expect(useFocusStore.getState().remainingSeconds).toBe(25 * 60);

    focusStore.setMode('deep_work');
    expect(useFocusStore.getState().targetMinutes).toBe(50);
    expect(useFocusStore.getState().remainingSeconds).toBe(50 * 60);
  });

  it('converts scratchpad text to task seamlessly', () => {
    const notesStore = useNotesStore.getState();
    notesStore.setScratchpad('Implement SQLite Write-Ahead Logging');
    notesStore.convertScratchpadToTask();

    const tasks = useTaskStore.getState().tasks;
    const created = tasks.find((t) => t.title.includes('Implement SQLite'));
    expect(created).toBeDefined();
    expect(created?.priority).toBe('P1');
  });
});
