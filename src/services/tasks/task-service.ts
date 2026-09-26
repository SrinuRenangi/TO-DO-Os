// ============================================================================
// Personal OS — Task Service
// Full CRUD, Priority, Due Date/Time, Recurring Generation & Subtasks
// ============================================================================

import { databaseService } from '../database/database-service';
import { TaskEntity, Priority, RecurringPattern, SubtaskEntity } from '../database/types';
import { generateId } from '@/lib/utils';
import { soundSynth } from '@/lib/sound-synth';
import { reminderService } from '../reminders/reminder-service';

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  recurring?: RecurringPattern;
}

export class TaskService {
  public getAllTasks(): TaskEntity[] {
    return databaseService.getTasks();
  }

  public getTaskById(id: string): TaskEntity | undefined {
    return databaseService.getTasks().find((t) => t.id === id);
  }

  public createTask(input: CreateTaskInput): TaskEntity {
    const today = new Date().toISOString().split('T')[0];
    const dueDate = input.dueDate || today;

    const newTask: TaskEntity = {
      id: generateId('task'),
      title: input.title.trim(),
      description: input.description?.trim(),
      priority: input.priority || 'P2',
      status: 'todo',
      dueDate,
      dueTime: input.dueTime,
      recurring: input.recurring || 'none',
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    databaseService.saveTask(newTask);

    // If task has due time, automatically schedule a real reminder!
    if (input.dueTime) {
      const [hours, mins] = input.dueTime.split(':').map(Number);
      const targetDate = new Date(`${dueDate}T00:00:00`);
      targetDate.setHours(hours, mins, 0, 0);

      // Format time e.g. "6:00 PM"
      const timeFormatted = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(targetDate);

      reminderService.createReminder({
        taskId: newTask.id,
        title: newTask.title,
        triggerTime: targetDate.toISOString(),
        dueTimeFormatted: timeFormatted,
        urgency: newTask.priority === 'P0' ? 'critical' : newTask.priority === 'P1' ? 'urgent' : 'normal',
      });
    }

    return newTask;
  }

  public updateTask(id: string, updates: Partial<TaskEntity>): TaskEntity | null {
    const task = this.getTaskById(id);
    if (!task) return null;

    const updatedTask: TaskEntity = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    databaseService.saveTask(updatedTask);
    return updatedTask;
  }

  public deleteTask(id: string): boolean {
    return databaseService.deleteTask(id);
  }

  public toggleTaskComplete(id: string): TaskEntity | null {
    const task = this.getTaskById(id);
    if (!task) return null;

    const isBecomingComplete = task.status !== 'completed';
    const now = new Date().toISOString();

    if (isBecomingComplete) {
      soundSynth.playChime('complete');
    }

    const updatedTask: TaskEntity = {
      ...task,
      status: isBecomingComplete ? 'completed' : 'todo',
      completedAt: isBecomingComplete ? now : undefined,
      updatedAt: now,
    };

    databaseService.saveTask(updatedTask);

    // If recurring and completed, spawn the next recurrence instance!
    if (isBecomingComplete && task.recurring !== 'none') {
      this.spawnNextRecurrence(task);
    }

    return updatedTask;
  }

  public addSubtask(taskId: string, title: string): SubtaskEntity | null {
    const task = this.getTaskById(taskId);
    if (!task) return null;

    const subtask: SubtaskEntity = {
      id: generateId('sub'),
      taskId,
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    task.subtasks.push(subtask);
    databaseService.saveTask(task);
    return subtask;
  }

  public toggleSubtask(taskId: string, subtaskId: string): boolean {
    const task = this.getTaskById(taskId);
    if (!task) return false;

    task.subtasks = task.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );

    databaseService.saveTask(task);
    return true;
  }

  public deleteSubtask(taskId: string, subtaskId: string): boolean {
    const task = this.getTaskById(taskId);
    if (!task) return false;

    task.subtasks = task.subtasks.filter((s) => s.id !== subtaskId);
    databaseService.saveTask(task);
    return true;
  }

  private spawnNextRecurrence(task: TaskEntity): void {
    const currentDueDate = new Date(task.dueDate);
    let nextDate = new Date(currentDueDate);

    if (task.recurring === 'daily') {
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (task.recurring === 'weekdays') {
      const day = nextDate.getDay();
      nextDate.setDate(nextDate.getDate() + (day === 5 ? 3 : day === 6 ? 2 : 1));
    } else if (task.recurring === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (task.recurring === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    const nextDueDateStr = nextDate.toISOString().split('T')[0];

    this.createTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: nextDueDateStr,
      dueTime: task.dueTime,
      recurring: task.recurring,
    });
  }
}

export const taskService = new TaskService();
