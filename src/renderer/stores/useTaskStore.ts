import { create } from 'zustand';
import { Task, Priority, TaskStatus, TaskCategory, RecurringPattern, Subtask } from '@shared/types';
import { taskService } from '@/services/tasks/task-service';
import { TaskEntity } from '@/services/database/types';

interface TaskState {
  tasks: Task[];
  filterPriority: Priority | 'ALL';
  filterStatus: TaskStatus | 'ALL';
  filterCategory: TaskCategory | 'ALL';
  viewMode: 'list' | 'kanban';
  searchQuery: string;

  // Actions
  refreshTasks: () => void;
  addTask: (
    title: string,
    priority?: Priority,
    category?: TaskCategory,
    dueDate?: string,
    dueTime?: string,
    recurring?: RecurringPattern,
    tags?: string[],
    estimatedMinutes?: number
  ) => Task;
  toggleTaskStatus: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  setViewMode: (mode: 'list' | 'kanban') => void;
  setFilterPriority: (priority: Priority | 'ALL') => void;
  setFilterStatus: (status: TaskStatus | 'ALL') => void;
  setFilterCategory: (category: TaskCategory | 'ALL') => void;
  setSearchQuery: (query: string) => void;
}

function entityToTask(entity: TaskEntity, index: number): Task {
  return {
    id: entity.id,
    title: entity.title,
    description: entity.description,
    priority: entity.priority,
    status: entity.status === 'completed' ? 'completed' : 'todo',
    category: 'Engineering',
    dueDate: entity.dueDate,
    dueTime: entity.dueTime,
    recurring: entity.recurring,
    tags: ['#task'],
    sortOrder: index,
    completedAt: entity.completedAt,
    subtasks: entity.subtasks.map((s, idx) => ({
      id: s.id,
      taskId: s.taskId,
      title: s.title,
      isCompleted: s.completed,
      sortOrder: idx,
    })),
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

function loadTasksFromService(): Task[] {
  const entities = taskService.getAllTasks();
  return entities.map(entityToTask);
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: loadTasksFromService(),
  filterPriority: 'ALL',
  filterStatus: 'ALL',
  filterCategory: 'ALL',
  viewMode: 'list',
  searchQuery: '',

  refreshTasks: () => {
    set({ tasks: loadTasksFromService() });
  },

  addTask: (
    title,
    priority = 'P2',
    category = 'Engineering',
    dueDate,
    dueTime,
    recurring = 'none',
    tags = ['#task'],
    estimatedMinutes
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const createdEntity = taskService.createTask({
      title,
      priority,
      dueDate: dueDate || today,
      dueTime,
      recurring,
    });

    const tasks = loadTasksFromService();
    set({ tasks });
    return entityToTask(createdEntity, tasks.length);
  },

  toggleTaskStatus: (id) => {
    taskService.toggleTaskComplete(id);
    set({ tasks: loadTasksFromService() });
  },

  deleteTask: (id) => {
    taskService.deleteTask(id);
    set({ tasks: loadTasksFromService() });
  },

  updateTask: (id, updates) => {
    taskService.updateTask(id, {
      title: updates.title,
      description: updates.description,
      priority: updates.priority,
      dueDate: updates.dueDate,
      dueTime: updates.dueTime,
      recurring: updates.recurring,
    });
    set({ tasks: loadTasksFromService() });
  },

  addSubtask: (taskId, title) => {
    taskService.addSubtask(taskId, title);
    set({ tasks: loadTasksFromService() });
  },

  toggleSubtask: (taskId, subtaskId) => {
    taskService.toggleSubtask(taskId, subtaskId);
    set({ tasks: loadTasksFromService() });
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterCategory: (category) => set({ filterCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
