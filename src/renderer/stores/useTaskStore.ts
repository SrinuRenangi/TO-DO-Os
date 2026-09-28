import { create } from 'zustand';
import { Task, Priority, TaskStatus, TaskCategory, RecurringPattern } from '@shared/types';
import { taskService, parseTaskCategory } from '@/services/tasks/task-service';
import { TaskEntity } from '@/services/database/types';

export type TaskSortField = 'dueDate' | 'priority' | 'title' | 'createdAt';
export type TaskSortOrder = 'asc' | 'desc';
export type TaskDateFilter = 'all' | 'today' | 'overdue' | 'upcoming';

interface TaskState {
  tasks: Task[];
  filterPriority: Priority | 'ALL';
  filterStatus: TaskStatus | 'ALL';
  filterCategory: TaskCategory | 'ALL';
  dateFilter: TaskDateFilter;
  sortBy: TaskSortField;
  sortOrder: TaskSortOrder;
  viewMode: 'list' | 'kanban';
  searchQuery: string;
  selectedTaskId: string | null;
  editingTaskId: string | null;

  // Actions
  refreshTasks: () => void;
  addTask: (
    title: string,
    priority?: Priority,
    category?: TaskCategory,
    dueDate?: string,
    dueTime?: string,
    recurring?: RecurringPattern,
    description?: string,
    tags?: string[],
    estimatedMinutes?: number,
    reminderUrgency?: 'normal' | 'urgent' | 'critical',
    reminderEnabled?: boolean
  ) => Task;
  toggleTaskStatus: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (
    id: string,
    updates: Partial<Task> & {
      reminderUrgency?: 'normal' | 'urgent' | 'critical';
      reminderEnabled?: boolean;
    }
  ) => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  setViewMode: (mode: 'list' | 'kanban') => void;
  setFilterPriority: (priority: Priority | 'ALL') => void;
  setFilterStatus: (status: TaskStatus | 'ALL') => void;
  setFilterCategory: (category: TaskCategory | 'ALL') => void;
  setDateFilter: (filter: TaskDateFilter) => void;
  setSortBy: (sortBy: TaskSortField) => void;
  setSortOrder: (sortOrder: TaskSortOrder) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTaskId: (id: string | null) => void;
  setEditingTaskId: (id: string | null) => void;
}

function entityToTask(entity: TaskEntity, index: number): Task {
  const { category, cleanDescription } = parseTaskCategory(entity.description);
  return {
    id: entity.id,
    title: entity.title,
    description: cleanDescription,
    priority: entity.priority,
    status: entity.status === 'completed' ? 'completed' : 'todo',
    category,
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
  filterStatus: 'todo',
  filterCategory: 'ALL',
  dateFilter: 'today',
  sortBy: 'dueDate',
  sortOrder: 'asc',
  selectedTaskId: null,
  editingTaskId: null,
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
    description,
    tags = ['#task'],
    estimatedMinutes,
    reminderUrgency,
    reminderEnabled
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const createdEntity = taskService.createTask({
      title,
      description,
      priority,
      category,
      dueDate: dueDate || today,
      dueTime,
      recurring,
      reminderUrgency,
      reminderEnabled,
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
      category: updates.category,
      dueDate: updates.dueDate,
      dueTime: updates.dueTime,
      recurring: updates.recurring,
      reminderUrgency: updates.reminderUrgency,
      reminderEnabled: updates.reminderEnabled,
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
  setDateFilter: (filter) => set({ dateFilter: filter }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  setEditingTaskId: (id) => set({ editingTaskId: id }),
}));
