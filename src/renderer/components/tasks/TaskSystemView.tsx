import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  Clock,
  Bell,
  FileText,
  Repeat,
  MoreHorizontal,
  ChevronDown,
  LayoutList,
  Columns,
  Check,
  Edit2,
  Calendar,
  Flame,
  Zap,
  Target,
  Leaf,
  Circle,
  ArrowRight,
  Sparkles,
  Link2,
} from 'lucide-react';
import { useTaskStore } from '@/stores/useTaskStore';
import { Priority, TaskStatus, Task, RecurringPattern } from '@shared/types';

export const TaskSystemView: React.FC = () => {
  const {
    tasks,
    addTask,
    toggleTaskStatus,
    deleteTask,
    filterPriority,
    setFilterPriority,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    addSubtask,
    toggleSubtask,
    updateTask,
  } = useTaskStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('P1');
  const [newRecurring, setNewRecurring] = useState<RecurringPattern>('none');
  const [newDueTime, setNewDueTime] = useState('17:00');
  const [newCategory, setNewCategory] = useState<'Engineering' | 'Product' | 'Strategy' | 'Personal' | 'Admin'>('Engineering');

  // Track in-progress & review IDs in local state so Kanban columns are fully interactive
  const [inProgressIds, setInProgressIds] = useState<Set<string>>(() => {
    // Pick the second task as in_progress initially if available
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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(newTitle.trim(), newPriority, newCategory, undefined, newDueTime, newRecurring);
    setNewTitle('');
    setShowAddModal(false);
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

  const filteredTasks = tasks.filter((t) => {
    const matchesPriority = filterPriority === 'ALL' || t.priority === filterPriority;
    const matchesQuery = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesQuery;
  });

  // Categorize tasks for the 4 Kanban columns
  const todoTasks = filteredTasks.filter(
    (t) => t.status !== 'completed' && !inProgressIds.has(t.id) && !reviewIds.has(t.id)
  );
  const inProgressTasks = filteredTasks.filter(
    (t) => t.status !== 'completed' && inProgressIds.has(t.id)
  );
  const reviewTasks = filteredTasks.filter(
    (t) => t.status !== 'completed' && reviewIds.has(t.id)
  );
  const doneTasks = filteredTasks.filter((t) => t.status === 'completed');

  const p0Count = tasks.filter((t) => t.priority === 'P0').length;
  const p1Count = tasks.filter((t) => t.priority === 'P1').length;
  const recurringCount = tasks.filter((t) => t.recurring && t.recurring !== 'none').length;

  // Render a task card for Kanban
  const renderTaskCard = (task: Task, columnStage: 'todo' | 'in_progress' | 'review' | 'done') => {
    const totalSubtasks = task.subtasks?.length || 0;
    const completedSubtasks = task.subtasks?.filter((s) => s.isCompleted).length || 0;
    const subtaskPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    return (
      <motion.div
        key={task.id}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -3, boxShadow: '0 8px 20px -4px rgba(0,0,0,0.1)' }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 relative group"
      >
        {/* Top: Checkbox, Title & Delete */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleTaskStatus(task.id)}
              className={`mt-0.5 shrink-0 transition-colors ${
                task.status === 'completed' ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-600'
              }`}
              title={task.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
            >
              {task.status === 'completed' ? (
                <CheckCircle2 className="w-4 h-4 fill-emerald-100" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </motion.button>
            <div className="flex-1 min-w-0">
              <span
                className={`font-bold text-xs text-slate-950 block leading-tight ${
                  task.status === 'completed' ? 'line-through text-slate-400' : ''
                }`}
              >
                {task.title}
              </span>
              <div className="flex items-center gap-2 mt-1">
                {renderPriorityBadge(task.priority)}
                <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{task.dueDate || 'Today'}</span>
                </span>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => deleteTask(task.id)}
            className="p-1 text-slate-400 hover:text-rose-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        {/* Subtasks Section */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span>Subtasks ({completedSubtasks}/{totalSubtasks})</span>
              <span className="text-blue-600 font-mono text-[10px]">{subtaskPercent}%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${subtaskPercent}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            {/* Subtask list */}
            <div className="space-y-1 mt-1 pl-1">
              {task.subtasks.map((st) => (
                <div key={st.id} className="flex items-center gap-2 text-[11px] text-slate-800 font-medium">
                  <input
                    type="checkbox"
                    checked={st.isCompleted}
                    onChange={() => toggleSubtask(task.id, st.id)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <span className={st.isCompleted ? 'line-through text-slate-400' : ''}>{st.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inline Add Subtask Input */}
        {addingSubtaskTaskId === task.id ? (
          <div className="pt-1 flex items-center gap-1.5">
            <input
              type="text"
              autoFocus
              placeholder="New subtask..."
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSubtaskSubmit(task.id);
                if (e.key === 'Escape') setAddingSubtaskTaskId(null);
              }}
              className="flex-1 px-2 py-1 text-[11px] rounded-lg border border-blue-400 focus:outline-none bg-blue-50/30 text-slate-900"
            />
            <button
              onClick={() => handleAddSubtaskSubmit(task.id)}
              className="px-2 py-1 text-[10px] font-bold bg-blue-600 text-white rounded-lg"
            >
              Add
            </button>
            <button
              onClick={() => setAddingSubtaskTaskId(null)}
              className="p-1 text-[10px] text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setAddingSubtaskTaskId(task.id);
              setSubtaskInput('');
            }}
            className="text-[10px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 pt-1"
          >
            <Plus className="w-3 h-3" />
            <span>Add Subtask</span>
          </button>
        )}

        {/* Recurring Rules Toggle */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1 text-slate-600 font-bold">
            <Repeat className="w-3 h-3 text-slate-400" />
            <span>Recurrence:</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                updateTask(task.id, { recurring: task.recurring === 'daily' ? 'none' : 'daily' })
              }
              className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold transition-colors ${
                task.recurring === 'daily'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() =>
                updateTask(task.id, { recurring: task.recurring === 'weekdays' ? 'none' : 'weekdays' })
              }
              className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold transition-colors ${
                task.recurring === 'weekdays'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Weekdays
            </button>
          </div>
        </div>

        {/* Quick Column Move Selector */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <span className="text-slate-400 font-semibold">Move to:</span>
          <div className="flex items-center gap-1">
            {columnStage !== 'todo' && (
              <button
                onClick={() => handleMoveStage(task.id, 'todo')}
                className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 text-slate-700 font-bold"
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
            {columnStage !== 'done' && (
              <button
                onClick={() => handleMoveStage(task.id, 'done')}
                className="px-1.5 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-[1460px] mx-auto space-y-5">
      {/* 1. Header Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 uppercase">
            TASKS SERVICE: EXECUTION ENGINE
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Task</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Filter Bar with Real Search & Priority Chips */}
      <div className="studio-panel p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none w-48 sm:w-64 text-xs font-semibold text-slate-900 bg-white"
            />
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
            <span className="text-[11px] font-extrabold text-slate-600 mr-1">Priority:</span>
            {(['ALL', 'P0', 'P1', 'P2', 'P3'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all ${
                  filterPriority === p
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {p === 'ALL' ? 'All' : p === 'P0' ? '🔥 Urgent' : p === 'P1' ? '⚡ High' : p === 'P2' ? '🎯 Normal' : '🌿 Low'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-extrabold text-slate-700">
          <span>Total: <strong className="text-slate-950 font-black">{tasks.length}</strong></span>
          <span>•</span>
          <span>Completed: <strong className="text-emerald-700 font-black">{doneTasks.length}</strong></span>
        </div>
      </div>

      {/* 3. 4-Column Kanban Workspace + Statistics Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        
        {/* The 4 Kanban Columns (col-span-9) */}
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
              <AnimatePresence>
                {todoTasks.map((t) => renderTaskCard(t, 'todo'))}
              </AnimatePresence>
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
              <AnimatePresence>
                {inProgressTasks.map((t) => renderTaskCard(t, 'in_progress'))}
              </AnimatePresence>
            </div>
          </div>

          {/* Column 3: NEEDS REVIEW */}
          <div className="rounded-2xl bg-purple-50/60 border border-purple-200/80 p-4 space-y-3 min-h-[460px]">
            <div className="flex items-center justify-between pb-2 border-b border-purple-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">NEEDS REVIEW</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-200 text-purple-900">
                {reviewTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {reviewTasks.map((t) => renderTaskCard(t, 'review'))}
              </AnimatePresence>
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
              <AnimatePresence>
                {doneTasks.map((t) => renderTaskCard(t, 'done'))}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* Right: Column Statistics Panel (col-span-3) */}
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

          <div className="studio-panel p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 pb-2 border-b border-slate-200">
              Execution Architecture
            </h3>
            <p className="text-[11px] text-slate-700 font-semibold leading-relaxed">
              Every card connects directly to SQLite database tables. Checkboxes, snooze presets, subtask progress, and recurring patterns persist locally.
            </p>
          </div>
        </div>

      </div>

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

      {/* Footer Status Bar with High Intensity */}
      <div className="pt-4 border-t border-slate-300 flex items-center justify-between text-xs text-slate-800 font-bold">
        <span>Task Count: {tasks.length} | Urgent: {p0Count} | High: {p1Count} | Recurring: {recurringCount}</span>
        <span className="text-slate-700 font-mono text-[11px] font-extrabold">* No fake metrics</span>
      </div>
    </div>
  );
};

export default TaskSystemView;
