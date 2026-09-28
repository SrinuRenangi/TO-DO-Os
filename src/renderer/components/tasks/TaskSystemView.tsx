import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Trash2,
  Clock,
  Repeat,
  LayoutList,
  Columns,
  Check,
  CheckSquare,
  Edit2,
  Calendar,
  Flame,
  Zap,
  Target,
  Leaf,
  Eye,
  AlertCircle,
  X,
} from 'lucide-react';
import { useTaskStore } from '@/stores/useTaskStore';
import { Priority, Task, RecurringPattern, TaskCategory } from '@shared/types';
import { taskService } from '@/services/tasks/task-service';
import { reminderService } from '@/services/reminders/reminder-service';

export const TaskSystemView: React.FC = () => {
  const {
    tasks,
    addTask,
    toggleTaskStatus,
    deleteTask,
    updateTask,
    addSubtask,
    toggleSubtask,
    filterStatus,
    setFilterStatus,
    dateFilter,
    setDateFilter,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
  } = useTaskStore();

  // Daily Usability State: Ordering (By Time vs By Need) and Custom Date
  const [orderingMode, setOrderingMode] = useState<'by_time' | 'by_need'>('by_time');
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Modals & Panels State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  // Add Task Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('P1');
  const [newRecurring, setNewRecurring] = useState<RecurringPattern>('none');
  const [newDueDate, setNewDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newDueTime, setNewDueTime] = useState('17:00');
  const [newCategory, setNewCategory] = useState<TaskCategory>('Engineering');
  const [newReminderEnabled, setNewReminderEnabled] = useState(true);
  const [newReminderUrgency, setNewReminderUrgency] = useState<'normal' | 'urgent' | 'critical'>('normal');

  // Edit Task Form State
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('P1');
  const [editCategory, setEditCategory] = useState<TaskCategory>('Engineering');
  const [editDueDate, setEditDueDate] = useState('');
  const [editDueTime, setEditDueTime] = useState('');
  const [editRecurring, setEditRecurring] = useState<RecurringPattern>('none');
  const [editReminderEnabled, setEditReminderEnabled] = useState(true);
  const [editReminderUrgency, setEditReminderUrgency] = useState<'normal' | 'urgent' | 'critical'>('normal');

  // Track in-progress & review IDs for Kanban columns
  const [inProgressIds, setInProgressIds] = useState<Set<string>>(() => {
    const set = new Set<string>();
    if (tasks.length > 1 && tasks[1]) set.add(tasks[1].id);
    return set;
  });

  const [reviewIds, setReviewIds] = useState<Set<string>>(() => {
    const set = new Set<string>();
    if (tasks.length > 2 && tasks[2]) set.add(tasks[2].id);
    return set;
  });

  const [addingSubtaskTaskId, setAddingSubtaskTaskId] = useState<string | null>(null);
  const [subtaskInput, setSubtaskInput] = useState('');

  // 24/7 Overdue Detection & Auto-Notification
  useEffect(() => {
    taskService.checkAndNotifyOverdueTasks();
    const interval = setInterval(() => {
      taskService.checkAndNotifyOverdueTasks();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle Create Task
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(
      newTitle.trim(),
      newPriority,
      newCategory,
      newDueDate,
      newDueTime || undefined,
      newRecurring,
      newDescription.trim() || undefined,
      ['#task'],
      0,
      newReminderUrgency,
      newReminderEnabled
    );
    setNewTitle('');
    setNewDescription('');
    setShowAddModal(false);
  };

  // Open Edit Modal
  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority);
    setEditCategory(task.category || 'Engineering');
    setEditDueDate(task.dueDate || new Date().toISOString().split('T')[0]);
    setEditDueTime(task.dueTime || '');
    setEditRecurring(task.recurring || 'none');

    const linkedRem = reminderService.getAllReminders().find((r) => r.taskId === task.id);
    setEditReminderEnabled(Boolean(linkedRem || task.dueTime));
    setEditReminderUrgency(
      linkedRem ? linkedRem.urgency : task.priority === 'P0' ? 'critical' : task.priority === 'P1' ? 'urgent' : 'normal'
    );
  };

  // Handle Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;
    updateTask(editingTask.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      priority: editPriority,
      category: editCategory,
      dueDate: editDueDate,
      dueTime: editDueTime.trim() || undefined,
      recurring: editRecurring,
      reminderEnabled: editReminderEnabled,
      reminderUrgency: editReminderUrgency,
    });
    setEditingTask(null);
    if (detailTask && detailTask.id === editingTask.id) {
      setDetailTask(null);
    }
  };

  const handleMoveStage = (taskId: string, targetStage: 'todo' | 'in_progress' | 'review' | 'done') => {
    const nextInProgress = new Set(inProgressIds);
    const nextReview = new Set(reviewIds);

    nextInProgress.delete(taskId);
    nextReview.delete(taskId);

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (targetStage === 'in_progress') {
      nextInProgress.add(taskId);
      if (task.status === 'completed') toggleTaskStatus(taskId);
    } else if (targetStage === 'review') {
      nextReview.add(taskId);
      if (task.status === 'completed') toggleTaskStatus(taskId);
    } else if (targetStage === 'done') {
      if (task.status !== 'completed') toggleTaskStatus(taskId);
    } else {
      if (task.status === 'completed') toggleTaskStatus(taskId);
    }

    setInProgressIds(nextInProgress);
    setReviewIds(nextReview);
  };

  const handleAddSubtaskSubmit = (taskId: string) => {
    if (!subtaskInput.trim()) return;
    addSubtask(taskId, subtaskInput.trim());
    setSubtaskInput('');
    setAddingSubtaskTaskId(null);
  };

  // Helper for priority badges
  const renderPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'P0':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
            <Flame className="w-3 h-3 text-rose-600 fill-rose-500 animate-pulse" />
            <span>Urgent</span>
          </span>
        );
      case 'P1':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
            <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
            <span>High</span>
          </span>
        );
      case 'P2':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-sky-100 text-sky-900 border border-sky-300">
            <Target className="w-3 h-3 text-sky-600" />
            <span>Normal</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <Leaf className="w-3 h-3 text-emerald-600" />
            <span>Low</span>
          </span>
        );
    }
  };

  // Overdue check
  const isOverdue = (task: Task) => {
    return taskService.isTaskOverdue(task);
  };

  // Combined Multi-Filtering & Sorting (Rebuilt for Daily Usability)
  const processedTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Filtering
    const filtered = tasks.filter((t) => {
      // Status filter: Strict separation between To Do and Completed
      const isCompleted = t.status === 'completed';
      if (filterStatus === 'completed') {
        if (!isCompleted) return false;
      } else {
        if (isCompleted) return false;
      }

      // Date filter (Default: today)
      if (dateFilter === 'today' && t.dueDate !== todayStr) return false;
      if (dateFilter === 'overdue' && !isOverdue(t)) return false;
      if (dateFilter === 'upcoming' && (!t.dueDate || t.dueDate <= todayStr)) return false;
      if ((dateFilter as any) === 'custom' && t.dueDate !== customDate) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description ? t.description.toLowerCase().includes(q) : false;
        if (!matchTitle && !matchDesc) return false;
      }

      return true;
    });

    // 2. Sorting (By Time vs By Need)
    const priorityWeight: Record<Priority, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };

    return filtered.sort((a, b) => {
      if (orderingMode === 'by_time') {
        const aDate = `${a.dueDate || '9999-99-99'} ${a.dueTime || '23:59'}`;
        const bDate = `${b.dueDate || '9999-99-99'} ${b.dueTime || '23:59'}`;
        return aDate.localeCompare(bDate);
      } else {
        const diff = priorityWeight[a.priority] - priorityWeight[b.priority];
        if (diff !== 0) return diff;
        const aDate = `${a.dueDate || '9999-99-99'} ${a.dueTime || '23:59'}`;
        const bDate = `${b.dueDate || '9999-99-99'} ${b.dueTime || '23:59'}`;
        return aDate.localeCompare(bDate);
      }
    });
  }, [tasks, filterStatus, dateFilter, customDate, searchQuery, orderingMode]);

  // Categorize for Kanban columns
  const todoTasks = processedTasks.filter(
    (t) => t.status !== 'completed' && !inProgressIds.has(t.id) && !reviewIds.has(t.id)
  );
  const inProgressTasks = processedTasks.filter(
    (t) => t.status !== 'completed' && inProgressIds.has(t.id)
  );
  const reviewTasks = processedTasks.filter(
    (t) => t.status !== 'completed' && reviewIds.has(t.id)
  );
  const doneTasks = processedTasks.filter((t) => t.status === 'completed');

  const p0Count = tasks.filter((t) => t.priority === 'P0').length;
  const p1Count = tasks.filter((t) => t.priority === 'P1').length;
  const recurringCount = tasks.filter((t) => t.recurring && t.recurring !== 'none').length;
  const overdueCount = tasks.filter((t) => isOverdue(t)).length;

  // Render a task card for Kanban
  const renderTaskCard = (task: Task, columnStage: 'todo' | 'in_progress' | 'review' | 'done') => {
    const totalSubtasks = task.subtasks?.length || 0;
    const completedSubtasks = task.subtasks?.filter((s) => s.isCompleted).length || 0;
    const taskOverdue = isOverdue(task);

    return (
      <motion.div
        key={task.id}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`bg-white rounded-xl p-3.5 shadow-xs border transition-all hover:shadow-md space-y-2.5 ${
          taskOverdue
            ? 'border-rose-400 bg-rose-50/20'
            : task.status === 'completed'
            ? 'border-emerald-200 opacity-80'
            : 'border-slate-200'
        }`}
      >
        {/* Top: Badges & Actions */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {renderPriorityBadge(task.priority)}
            {taskOverdue && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white uppercase">
                <AlertCircle className="w-2.5 h-2.5" />
                Overdue
              </span>
            )}
            {task.recurring && task.recurring !== 'none' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                <Repeat className="w-2.5 h-2.5" />
                {task.recurring}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() => openEditModal(task)}
              title="Edit Task"
              className="p-1 rounded hover:bg-slate-100 hover:text-blue-600 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDetailTask(task)}
              title="View Details"
              className="p-1 rounded hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              title="Delete Task"
              className="p-1 rounded hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h4
          onClick={() => setDetailTask(task)}
          className={`text-xs font-bold leading-snug cursor-pointer hover:text-blue-600 transition-colors ${
            task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900'
          }`}
        >
          {task.title}
        </h4>

        {/* Due Date & Time */}
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {task.dueDate}
          </span>
          {task.dueTime && (
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {task.dueTime}
            </span>
          )}
        </div>

        {/* Subtasks Summary */}
        {totalSubtasks > 0 && (
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>Subtasks</span>
            <span>
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>
        )}

        {/* Stage Mover Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]">
          <button
            onClick={() => toggleTaskStatus(task.id)}
            className={`px-2 py-0.5 rounded font-extrabold flex items-center gap-1 transition-all ${
              task.status === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800'
            }`}
          >
            <Check className="w-3 h-3" />
            {task.status === 'completed' ? 'Done' : 'Mark Done'}
          </button>

          <div className="flex items-center gap-1">
            {columnStage !== 'todo' && (
              <button
                onClick={() => handleMoveStage(task.id, 'todo')}
                className="px-1.5 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold"
              >
                To Do
              </button>
            )}
            {columnStage !== 'in_progress' && (
              <button
                onClick={() => handleMoveStage(task.id, 'in_progress')}
                className="px-1.5 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold"
              >
                In Prog
              </button>
            )}
            {columnStage !== 'review' && (
              <button
                onClick={() => handleMoveStage(task.id, 'review')}
                className="px-1.5 py-0.5 rounded bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold"
              >
                Review
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-[1460px] mx-auto space-y-4">
      {/* 1. Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 uppercase">
            TASKS SERVICE: EXECUTION ENGINE
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle: List vs Kanban */}
          <div className="flex items-center bg-white border border-slate-300 rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Task</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Rebuilt Usability Toolbar: Status (To Do / Completed) | Ordering (By Time / By Need) | Date Filter */}
      <div className="studio-panel p-4 space-y-3.5 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Filter Tabs (To Do vs Completed) */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setFilterStatus('todo')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                filterStatus !== 'completed'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>To Do ({tasks.filter((t) => t.status !== 'completed').length})</span>
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                filterStatus === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Completed ({tasks.filter((t) => t.status === 'completed').length})</span>
            </button>
          </div>

          {/* Ordering Mode (By Time / By Need) */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Order:</span>
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5">
              <button
                onClick={() => setOrderingMode('by_time')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  orderingMode === 'by_time'
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Sort by Due Date and Time"
              >
                <Clock className="w-3 h-3" />
                <span>By Time</span>
              </button>
              <button
                onClick={() => setOrderingMode('by_need')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  orderingMode === 'by_need'
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Sort by Importance / Priority (P0 -> P1 -> P2 -> P3)"
              >
                <Flame className="w-3 h-3 text-rose-600" />
                <span>By Need</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none w-48 sm:w-60 text-xs font-semibold text-slate-900 bg-white"
            />
          </div>
        </div>

        {/* Date Filter Row (Today / Overdue / Upcoming / Custom Date) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase mr-1">Date:</span>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                dateFilter === 'today'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('overdue')}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 ${
                dateFilter === 'overdue'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Overdue</span>
              {overdueCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${dateFilter === 'overdue' ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-800'}`}>
                  {overdueCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setDateFilter('upcoming')}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                dateFilter === 'upcoming'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Upcoming
            </button>
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setDateFilter('custom' as any);
                }}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold border transition-all ${
                  (dateFilter as any) === 'custom'
                    ? 'bg-blue-50 border-blue-400 text-blue-900'
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              />
            </div>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-500 hover:text-slate-800 ${
                dateFilter === 'all' ? 'underline font-extrabold text-slate-900' : ''
              }`}
            >
              All Time
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-600">
            <span>Showing: <strong className="text-slate-950">{processedTasks.length}</strong> tasks</span>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: Kanban or List View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* Kanban Columns (9 cols) */}
          <div className="xl:col-span-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Column 1: TO DO */}
            <div className="rounded-2xl bg-blue-50/60 border border-blue-200/80 p-4 space-y-3 min-h-[460px]">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">TO DO</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-200 text-blue-900">
                  {todoTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                <AnimatePresence>{todoTasks.map((t) => renderTaskCard(t, 'todo'))}</AnimatePresence>
              </div>
            </div>

            {/* Column 2: IN PROGRESS */}
            <div className="rounded-2xl bg-amber-50/60 border border-amber-200/80 p-4 space-y-3 min-h-[460px]">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">IN PROGRESS</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900">
                  {inProgressTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                <AnimatePresence>{inProgressTasks.map((t) => renderTaskCard(t, 'in_progress'))}</AnimatePresence>
              </div>
            </div>

            {/* Column 3: REVIEW */}
            <div className="rounded-2xl bg-purple-50/60 border border-purple-200/80 p-4 space-y-3 min-h-[460px]">
              <div className="flex items-center justify-between pb-2 border-b border-purple-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">REVIEW</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-200 text-purple-900">
                  {reviewTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                <AnimatePresence>{reviewTasks.map((t) => renderTaskCard(t, 'review'))}</AnimatePresence>
              </div>
            </div>

            {/* Column 4: DONE */}
            <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200/80 p-4 space-y-3 min-h-[460px]">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">DONE</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-200 text-emerald-900">
                  {doneTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                <AnimatePresence>{doneTasks.map((t) => renderTaskCard(t, 'done'))}</AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Metrics Panel (3 cols) */}
          <div className="xl:col-span-3 space-y-5">
            <div className="studio-panel p-5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 pb-2 border-b border-slate-200">
                Task Metrics
              </h3>
              <div className="space-y-2 text-xs font-bold text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Total Active Tasks:</span>
                  <span className="text-slate-950 font-black">{tasks.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Due Today:</span>
                  <span className="text-blue-700 font-black">
                    {tasks.filter((t) => t.dueDate === new Date().toISOString().split('T')[0]).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Overdue Tasks:</span>
                  <span className="text-rose-700 font-black">{overdueCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Urgent (P0):</span>
                  <span className="text-rose-700 font-black">{p0Count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>High (P1):</span>
                  <span className="text-amber-700 font-black">{p1Count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Recurring Rules:</span>
                  <span className="text-emerald-700 font-black">{recurringCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="studio-panel overflow-hidden border border-slate-200 divide-y divide-slate-100">
          <div className="p-3 bg-slate-50 grid grid-cols-12 text-[11px] font-black uppercase tracking-wider text-slate-600">
            <div className="col-span-5 sm:col-span-6">Task Title</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-3 sm:col-span-2">Due Date</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {processedTasks.length === 0 ? (
            <div className="p-8 text-center text-xs font-bold text-slate-500">
              No tasks match current filter criteria.
            </div>
          ) : (
            processedTasks.map((t) => {
              const taskOverdue = isOverdue(t);
              return (
                <div
                  key={t.id}
                  className={`p-3 grid grid-cols-12 items-center text-xs hover:bg-slate-50/80 transition-colors ${
                    taskOverdue ? 'bg-rose-50/20' : ''
                  }`}
                >
                  <div className="col-span-5 sm:col-span-6 flex items-center gap-2">
                    <button
                      onClick={() => toggleTaskStatus(t.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        t.status === 'completed'
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {t.status === 'completed' && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <span
                      onClick={() => setDetailTask(t)}
                      className={`font-bold cursor-pointer hover:text-blue-600 transition-colors ${
                        t.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {t.title}
                    </span>
                    {taskOverdue && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-600 text-white uppercase">
                        Overdue
                      </span>
                    )}
                    {t.recurring && t.recurring !== 'none' && (
                      <Repeat className="w-3 h-3 text-purple-600" />
                    )}
                  </div>

                  <div className="col-span-2">
                    {renderPriorityBadge(t.priority)}
                  </div>

                  <div className="col-span-3 sm:col-span-2 text-slate-600 font-semibold text-[11px]">
                    {t.dueDate} {t.dueTime || ''}
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEditModal(t)}
                      className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                      title="Edit Task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDetailTask(t)}
                      className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTask(t.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 4. Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-300 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-black text-slate-950">Add New Task</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Task title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Additional context or notes..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-semibold text-slate-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-bold text-slate-900 bg-white"
                  >
                    <option value="P0">🔥 Urgent (P0)</option>
                    <option value="P1">⚡ High (P1)</option>
                    <option value="P2">🎯 Normal (P2)</option>
                    <option value="P3">🌿 Low (P3)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-bold text-slate-900 bg-white"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Strategy">Strategy</option>
                    <option value="Personal">Personal</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-semibold text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Due Time (Reminder)</label>
                  <input
                    type="time"
                    value={newDueTime}
                    onChange={(e) => setNewDueTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-semibold text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Recurrence</label>
                <select
                  value={newRecurring}
                  onChange={(e) => setNewRecurring(e.target.value as RecurringPattern)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-bold text-slate-900 bg-white"
                >
                  <option value="none">One-time Task</option>
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Native Reminder Settings */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newReminderEnabled}
                      onChange={(e) => setNewReminderEnabled(e.target.checked)}
                      className="rounded"
                    />
                    <span>Enable Native Reminder</span>
                  </label>
                  {newReminderEnabled && (
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                {newReminderEnabled && (
                  <div className="pt-1">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Reminder Urgency</label>
                    <select
                      value={newReminderUrgency}
                      onChange={(e) => setNewReminderUrgency(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 font-semibold text-slate-900 bg-white"
                    >
                      <option value="normal">Normal (Chime)</option>
                      <option value="urgent">Urgent (Persistent)</option>
                      <option value="critical">Critical (Highest Priority)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20"
                >
                  Save Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 5. Complete Task Edit Modal (Step 2) */}
      {editingTask && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-300 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-black text-slate-950">Edit Task</h3>
              <button
                onClick={() => setEditingTask(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-semibold text-slate-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-bold text-slate-900 bg-white"
                  >
                    <option value="P0">🔥 Urgent (P0)</option>
                    <option value="P1">⚡ High (P1)</option>
                    <option value="P2">🎯 Normal (P2)</option>
                    <option value="P3">🌿 Low (P3)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-bold text-slate-900 bg-white"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Strategy">Strategy</option>
                    <option value="Personal">Personal</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-semibold text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Due Time (Reminder)</label>
                  <input
                    type="time"
                    value={editDueTime}
                    onChange={(e) => setEditDueTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-semibold text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Recurrence</label>
                <select
                  value={editRecurring}
                  onChange={(e) => setEditRecurring(e.target.value as RecurringPattern)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-bold text-slate-900 bg-white"
                >
                  <option value="none">One-time Task</option>
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Native Reminder Settings */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editReminderEnabled}
                      onChange={(e) => setEditReminderEnabled(e.target.checked)}
                      className="rounded"
                    />
                    <span>Enable Native Reminder</span>
                  </label>
                  {editReminderEnabled && (
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                {editReminderEnabled && (
                  <div className="pt-1">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Reminder Urgency</label>
                    <select
                      value={editReminderUrgency}
                      onChange={(e) => setEditReminderUrgency(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 font-semibold text-slate-900 bg-white"
                    >
                      <option value="normal">Normal (Chime)</option>
                      <option value="urgent">Urgent (Persistent)</option>
                      <option value="critical">Critical (Highest Priority)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 6. Task Details View Slide-over Panel (Step 6) */}
      {detailTask && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex justify-end">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-5 border-l border-slate-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 uppercase">Task Details</span>
                {renderPriorityBadge(detailTask.priority)}
              </div>
              <button
                onClick={() => setDetailTask(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-base font-black text-slate-950">{detailTask.title}</h2>
                {detailTask.description && (
                  <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed whitespace-pre-wrap">
                    {detailTask.description}
                  </p>
                )}
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs font-bold border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-slate-900 capitalize font-black">{detailTask.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="text-slate-900 font-black">{detailTask.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Due Date:</span>
                  <span className="text-slate-900 font-mono font-black">{detailTask.dueDate}</span>
                </div>
                {detailTask.dueTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Due Time:</span>
                    <span className="text-slate-900 font-mono font-black">{detailTask.dueTime}</span>
                  </div>
                )}
                {isOverdue(detailTask) && (
                  <div className="flex items-center justify-between text-rose-600 font-black">
                    <span>Deadline State:</span>
                    <span>⚠️ Overdue</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Recurrence:</span>
                  <span className="text-slate-900 capitalize font-black">{detailTask.recurring || 'None'}</span>
                </div>

                {/* Linked Reminder Metadata */}
                {(() => {
                  const linkedRem = reminderService.getAllReminders().find((r) => r.taskId === detailTask.id);
                  if (linkedRem) {
                    return (
                      <div className="pt-2 border-t border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Reminder State:</span>
                          <span className="text-emerald-700 font-extrabold capitalize">
                            {linkedRem.isTriggered ? 'Triggered / Fired' : linkedRem.isSnoozed ? 'Snoozed' : 'Scheduled Active'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Reminder Urgency:</span>
                          <span className="capitalize font-black text-slate-800">{linkedRem.urgency}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Reminder Time:</span>
                          <span className="font-mono text-slate-800">{linkedRem.dueTimeFormatted || linkedRem.triggerTime}</span>
                        </div>
                      </div>
                    );
                  } else if (detailTask.dueTime) {
                    return (
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-slate-500">Reminder State:</span>
                        <span className="text-slate-700 font-bold">Auto-Scheduled ({detailTask.dueTime})</span>
                      </div>
                    );
                  }
                  return (
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-slate-500">Reminder State:</span>
                      <span className="text-slate-400 font-medium">None configured</span>
                    </div>
                  );
                })()}
              </div>

              {/* Subtasks Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-slate-900">
                    Subtasks ({detailTask.subtasks?.length || 0})
                  </h4>
                  <button
                    onClick={() => setAddingSubtaskTaskId(detailTask.id)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    + Add Subtask
                  </button>
                </div>

                {addingSubtaskTaskId === detailTask.id && (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Subtask name..."
                      value={subtaskInput}
                      onChange={(e) => setSubtaskInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSubtaskSubmit(detailTask.id)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleAddSubtaskSubmit(detailTask.id)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                )}

                <div className="space-y-1.5">
                  {detailTask.subtasks?.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => toggleSubtask(detailTask.id, s.id)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs font-semibold"
                    >
                      <input
                        type="checkbox"
                        checked={s.isCompleted}
                        onChange={() => {}}
                        className="rounded"
                      />
                      <span className={s.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}>
                        {s.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* History / Timestamps */}
              <div className="text-[11px] font-semibold text-slate-400 space-y-1 pt-3 border-t border-slate-200">
                <div>Created: {new Date(detailTask.createdAt || '').toLocaleString()}</div>
                <div>Updated: {new Date(detailTask.updatedAt || '').toLocaleString()}</div>
                {detailTask.completedAt && (
                  <div>Completed: {new Date(detailTask.completedAt).toLocaleString()}</div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                <button
                  onClick={() => openEditModal(detailTask)}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                >
                  Edit Task
                </button>
                <button
                  onClick={() => {
                    deleteTask(detailTask.id);
                    setDetailTask(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer Status Bar */}
      <div className="pt-4 border-t border-slate-300 flex items-center justify-between text-xs text-slate-800 font-bold">
        <span>Active: {tasks.length} | Urgent (P0): {p0Count} | High (P1): {p1Count} | Overdue: {overdueCount}</span>
        <span className="text-slate-700 font-mono text-[11px] font-extrabold">* Real SQLite durability</span>
      </div>
    </div>
  );
};

export default TaskSystemView;
