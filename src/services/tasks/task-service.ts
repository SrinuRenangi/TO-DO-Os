// ============================================================================
// Personal OS — Task Service
// Full CRUD, Priority, Due Date/Time, Recurring Generation & Subtasks
// ============================================================================

import { databaseService } from '../database/database-service';
import { TaskEntity, Priority, RecurringPattern, SubtaskEntity } from '../database/types';
import { TaskCategory } from '@shared/types';
import { generateId } from '@/lib/utils';
import { soundSynth } from '@/lib/sound-synth';
import { reminderService } from '../reminders/reminder-service';
import { notificationService } from '../notifications/notification-service';

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  category?: TaskCategory;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  recurring?: RecurringPattern;
  reminderUrgency?: 'normal' | 'urgent' | 'critical';
  reminderEnabled?: boolean;
}

export interface UpdateTaskInput extends Partial<TaskEntity> {
  category?: TaskCategory;
  reminderUrgency?: 'normal' | 'urgent' | 'critical';
  reminderEnabled?: boolean;
}

export function parseTaskCategory(description?: any): { category: TaskCategory; cleanDescription?: string } {
  if (!description || typeof description !== 'string') return { category: 'Engineering', cleanDescription: undefined };
  const match = description.match(/<!--category:(Engineering|Product|Strategy|Personal|Admin)-->/);
  if (match) {
    const category = match[1] as TaskCategory;
    const clean = description.replace(/<!--category:(Engineering|Product|Strategy|Personal|Admin)-->\n?/, '').trim();
    return { category, cleanDescription: clean || undefined };
  }
  return { category: 'Engineering', cleanDescription: description };
}

export function formatTaskDescription(description?: any, category?: TaskCategory): string | undefined {
  const descStr = typeof description === 'string' ? description : '';
  const clean = descStr
    ? descStr.replace(/<!--category:(Engineering|Product|Strategy|Personal|Admin)-->\n?/, '').trim()
    : '';
  const cat = category || 'Engineering';
  return `<!--category:${cat}-->${clean ? '\n' + clean : ''}`;
}

export class TaskService {
  private notifiedOverdueTasks = new Set<string>();

  public getAllTasks(): TaskEntity[] {
    return databaseService.getTasks();
  }

  public getTaskById(id: string): TaskEntity | undefined {
    return databaseService.getTasks().find((t) => t.id === id);
  }

  public createTask(input: CreateTaskInput): TaskEntity {
    const today = new Date().toISOString().split('T')[0];
    const dueDate = input.dueDate || today;
    const formattedDesc = formatTaskDescription(input.description, input.category);

    const newTask: TaskEntity = {
      id: generateId('task'),
      title: input.title.trim(),
      description: formattedDesc,
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

    // If task has due time and reminder is not disabled, automatically schedule a real reminder!
    if (input.dueTime && input.reminderEnabled !== false) {
      const [hours, mins] = input.dueTime.split(':').map(Number);
      const [y, m, d] = dueDate.split('-').map(Number);
      const targetDate = new Date(y, m - 1, d, hours, mins, 0, 0);

      // Format time e.g. "6:00 PM"
      const timeFormatted = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(targetDate);

      const defaultUrgency = newTask.priority === 'P0' ? 'critical' : newTask.priority === 'P1' ? 'urgent' : 'normal';

      reminderService.createReminder({
        taskId: newTask.id,
        title: newTask.title,
        triggerTime: targetDate.toISOString(),
        dueTimeFormatted: timeFormatted,
        urgency: input.reminderUrgency || defaultUrgency,
      });
    }

    return newTask;
  }

  public updateTask(id: string, updates: UpdateTaskInput): TaskEntity | null {
    const task = this.getTaskById(id);
    if (!task) return null;

    const currentParsed = parseTaskCategory(task.description);
    const effectiveCategory = updates.category !== undefined ? updates.category : currentParsed.category;
    const effectiveDesc = updates.description !== undefined ? updates.description : currentParsed.cleanDescription;
    const newFormattedDesc = formatTaskDescription(effectiveDesc, effectiveCategory);

    const updatedTask: TaskEntity = {
      ...task,
      ...updates,
      description: newFormattedDesc,
      updatedAt: new Date().toISOString(),
    };

    databaseService.saveTask(updatedTask);

    // Synchronize linked reminder if due date/time, title, priority, or reminder settings changed
    if (
      updates.dueDate !== undefined ||
      updates.dueTime !== undefined ||
      updates.title !== undefined ||
      updates.priority !== undefined ||
      updates.reminderUrgency !== undefined ||
      updates.reminderEnabled !== undefined
    ) {
      const existingRem = reminderService.getAllReminders().find((r) => r.taskId === id);
      const effectiveDueDate = updatedTask.dueDate;
      const effectiveDueTime = updatedTask.dueTime;
      const effectiveTitle = updatedTask.title;
      const effectivePriority = updatedTask.priority;
      const shouldHaveReminder = updates.reminderEnabled !== false && Boolean(effectiveDueTime);

      if (shouldHaveReminder && effectiveDueTime) {
        const [hours, mins] = effectiveDueTime.split(':').map(Number);
        const [y, m, d] = effectiveDueDate.split('-').map(Number);
        const targetDate = new Date(y, m - 1, d, hours, mins, 0, 0);

        const timeFormatted = new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }).format(targetDate);

        const defaultUrgency = effectivePriority === 'P0' ? 'critical' : effectivePriority === 'P1' ? 'urgent' : 'normal';
        const urgency = updates.reminderUrgency || (existingRem ? existingRem.urgency : defaultUrgency);

        if (existingRem) {
          databaseService.saveReminder({
            ...existingRem,
            title: effectiveTitle,
            triggerTime: targetDate.toISOString(),
            dueTimeFormatted: timeFormatted,
            urgency,
            isTriggered: false,
          });
        } else {
          reminderService.createReminder({
            taskId: task.id,
            title: effectiveTitle,
            triggerTime: targetDate.toISOString(),
            dueTimeFormatted: timeFormatted,
            urgency,
          });
        }
      } else if (existingRem && (updates.reminderEnabled === false || updates.dueTime === null || !effectiveDueTime)) {
        reminderService.deleteReminder(existingRem.id);
      }
    }

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
      notificationService.dispatch({
        title: `Task Completed: ${task.title}`,
        body: 'Marked completed in Personal Organizer.',
        urgency: 'normal',
        sound: false,
      });
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

  public isTaskOverdue(task: { status: string; dueDate?: string; dueTime?: string }): boolean {
    if (task.status === 'completed' || task.status === 'canceled') return false;
    if (!task.dueDate) return false;
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (task.dueDate < todayStr) return true;
    if (task.dueDate === todayStr && task.dueTime) {
      const [h, m] = task.dueTime.split(':').map(Number);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      return (h * 60 + m) < currentMinutes;
    }
    return false;
  }

  public checkOverdueTasks(): TaskEntity[] {
    const tasks = this.getAllTasks();
    return tasks.filter((t) => this.isTaskOverdue(t));
  }

  public checkAndNotifyOverdueTasks(): TaskEntity[] {
    const overdue = this.checkOverdueTasks();
    for (const t of overdue) {
      if (!this.notifiedOverdueTasks.has(t.id)) {
        this.notifiedOverdueTasks.add(t.id);
        notificationService.dispatch({
          title: `Overdue Task: ${t.title}`,
          body: `Due date was ${t.dueDate}${t.dueTime ? ' at ' + t.dueTime : ''}. Please take action.`,
          urgency: 'urgent',
          sound: true,
        });
      }
    }
    return overdue;
  }

  private spawnNextRecurrence(task: TaskEntity): void {
    const [y, m, d] = task.dueDate.split('-').map(Number);
    const nextDate = new Date(y, m - 1, d);

    if (task.recurring === 'daily') {
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (task.recurring === 'weekdays') {
      const day = nextDate.getDay();
      const addDays = day === 5 ? 3 : day === 6 ? 2 : 1;
      nextDate.setDate(nextDate.getDate() + addDays);
    } else if (task.recurring === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (task.recurring === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    const nextYear = nextDate.getFullYear();
    const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
    const nextDay = String(nextDate.getDate()).padStart(2, '0');
    const nextDueDateStr = `${nextYear}-${nextMonth}-${nextDay}`;

    const { category, cleanDescription } = parseTaskCategory(task.description);

    this.createTask({
      title: task.title,
      description: cleanDescription,
      priority: task.priority,
      category,
      dueDate: nextDueDateStr,
      dueTime: task.dueTime,
      recurring: task.recurring,
    });
  }
}

export const taskService = new TaskService();

