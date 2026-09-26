import { create } from 'zustand';
import { Task, Priority, TaskStatus } from '@shared/types';
import { generateId } from '@/lib/utils';
import { soundSynth } from '@/lib/sound-synth';

interface TaskState {
  tasks: Task[];
  filterPriority: Priority | 'ALL';
  filterStatus: TaskStatus | 'ALL';
  searchQuery: string;

  // Actions
  addTask: (title: string, priority?: Priority, tags?: string[], estimatedMinutes?: number) => Task;
  toggleTaskStatus: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setFilterPriority: (priority: Priority | 'ALL') => void;
  setFilterStatus: (status: TaskStatus | 'ALL') => void;
  setSearchQuery: (query: string) => void;
}

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Finalize Personal OS Architectural Blueprint & IPC Contract',
    description: 'Ensure context isolation and zero latency typed invoke handlers.',
    priority: 'P0',
    status: 'completed',
    estimatedMinutes: 45,
    actualMinutes: 40,
    tags: ['#architecture', '#core'],
    subtasks: [
      { id: 'sub-1', taskId: 'task-1', title: 'Draft IPC channel schema', isCompleted: true, sortOrder: 0 },
      { id: 'sub-2', taskId: 'task-1', title: 'Specify Better-SQLite3 WAL pragmas', isCompleted: true, sortOrder: 1 },
    ],
    sortOrder: 0,
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Deploy Apple-Grade Day Timeline & Timeblocker Component',
    description: 'Render continuous 24-hour hour rule with live time marker.',
    priority: 'P0',
    status: 'in_progress',
    estimatedMinutes: 60,
    tags: ['#frontend', '#motion'],
    subtasks: [
      { id: 'sub-3', taskId: 'task-2', title: 'Calculate current minute offset', isCompleted: true, sortOrder: 0 },
      { id: 'sub-4', taskId: 'task-2', title: 'Add fluid red timeline indicator', isCompleted: false, sortOrder: 1 },
    ],
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Configure Zero-Dependency Ambient Sound Generator',
    description: 'Implement white noise, rain, and 40Hz gamma binaural oscillations via Web Audio API.',
    priority: 'P1',
    status: 'todo',
    estimatedMinutes: 30,
    tags: ['#audio', '#focus'],
    subtasks: [],
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Review Weekly Retrospective & Goal Key Results',
    description: 'Verify Q3 deliverables and update progress bars.',
    priority: 'P2',
    status: 'todo',
    estimatedMinutes: 25,
    tags: ['#strategy'],
    subtasks: [],
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: INITIAL_TASKS,
  filterPriority: 'ALL',
  filterStatus: 'ALL',
  searchQuery: '',

  addTask: (title, priority = 'P2', tags = ['#focus'], estimatedMinutes = 30) => {
    const newTask: Task = {
      id: generateId('task'),
      title,
      priority,
      status: 'todo',
      tags,
      estimatedMinutes,
      subtasks: [],
      sortOrder: get().tasks.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      tasks: [newTask, ...state.tasks],
    }));

    return newTask;
  },

  toggleTaskStatus: (id) => {
    set((state) => {
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return state;

      const isBecomingComplete = task.status !== 'completed';
      if (isBecomingComplete) {
        soundSynth.playChime('complete');
      }

      return {
        tasks: state.tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                status: isBecomingComplete ? 'completed' : 'todo',
                completedAt: isBecomingComplete ? new Date().toISOString() : undefined,
                updatedAt: new Date().toISOString(),
              }
            : t
        ),
      };
    });
  },

  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
    }));
  },

  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
