import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  LayoutList,
  Columns,
  Clock,
  Tag,
  AlertCircle,
  Check,
  Trash2,
  Calendar,
  ChevronDown,
  Repeat,
} from 'lucide-react';
import { useTaskStore } from '@/stores/useTaskStore';
import { Priority, TaskCategory, TaskStatus, Task, RecurringPattern } from '@shared/types';

export const TaskSystemView: React.FC = () => {
  const {
    tasks,
    addTask,
    toggleTaskStatus,
    deleteTask,
    filterPriority,
    setFilterPriority,
    filterCategory,
    setFilterCategory,
    filterStatus,
    setFilterStatus,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    addSubtask,
    toggleSubtask,
  } = useTaskStore();

  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('P1');
  const [newCategory, setNewCategory] = useState<TaskCategory>('Engineering');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDueTime, setNewDueTime] = useState('17:00');
  const [newRecurring, setNewRecurring] = useState<RecurringPattern>('none');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [subtaskInput, setSubtaskInput] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(
      newTitle.trim(),
      newPriority,
      newCategory,
      newDueDate,
      newDueTime,
      newRecurring,
      [`#${newCategory.toLowerCase()}`]
    );
    setNewTitle('');
  };

  const handleAddSubtask = (taskId: string) => {
    if (!subtaskInput.trim()) return;
    addSubtask(taskId, subtaskInput.trim());
    setSubtaskInput('');
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesPriority = filterPriority === 'ALL' || t.priority === filterPriority;
    const matchesCategory = filterCategory === 'ALL' || t.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const matchesQuery =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPriority && matchesCategory && matchesStatus && matchesQuery;
  });

  const priorityColors = {
    P0: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30',
    P1: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30',
    P2: 'text-[#4F8CFF] bg-[#4F8CFF]/10 border-[#4F8CFF]/30',
    P3: 'text-[#64748B] bg-[#64748B]/10 border-[#64748B]/30',
  };

  const categories: TaskCategory[] = ['Engineering', 'Product', 'Strategy', 'Personal', 'Admin'];

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-6">
      {/* Header & Controls */}
      <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#4F8CFF]/15 text-[#4F8CFF]">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">Task Execution Engine</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#1A2333] text-[#4F8CFF] border border-[#4F8CFF]/30">
                {tasks.filter((t) => t.status !== 'completed').length} Pending
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              Deterministic, keyboard-driven execution queue with List & Kanban views, recurring schedules, and auto-reminders.
            </p>
          </div>

          {/* View Mode & Search */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1A2333]">
              <Search className="w-4 h-4 text-[#64748B]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="bg-transparent text-xs text-[#F8FAFC] placeholder-[#64748B] outline-none w-36 md:w-52"
              />
            </div>

            <div className="flex items-center p-1 rounded-xl bg-[#1A2333] border border-[rgba(255,255,255,0.06)]">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'list' ? 'bg-[#4F8CFF] text-white shadow-md' : 'text-[#64748B] hover:text-[#F8FAFC]'
                }`}
                title="List View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'kanban' ? 'bg-[#4F8CFF] text-white shadow-md' : 'text-[#64748B] hover:text-[#F8FAFC]'
                }`}
                title="Kanban Board View"
              >
                <Columns className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Priority filter */}
          <div className="flex items-center gap-1 bg-[#1A2333] p-1 rounded-xl border border-[rgba(255,255,255,0.06)]">
            {(['ALL', 'P0', 'P1', 'P2', 'P3'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  filterPriority === p ? 'bg-[#4F8CFF] text-white' : 'text-[#64748B] hover:text-[#F8FAFC]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-[#1A2333] p-1 rounded-xl border border-[rgba(255,255,255,0.06)]">
            {(['ALL', 'todo', 'completed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s as any)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize transition-all ${
                  filterStatus === s ? 'bg-[#4F8CFF] text-white' : 'text-[#64748B] hover:text-[#F8FAFC]'
                }`}
              >
                {s === 'ALL' ? 'All Status' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task Creation Form */}
      <form onSubmit={handleCreate} className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add task title (e.g. Buy Medicine, Plasma Control Audit)..."
            className="flex-1 w-full bg-[#1A2333] text-xs text-[#F8FAFC] placeholder-[#64748B] outline-none px-3.5 py-2.5 rounded-xl border border-[rgba(255,255,255,0.08)] focus:border-[#4F8CFF]/60"
          />

          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
            {/* Priority */}
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as Priority)}
              className="px-2.5 py-2 rounded-xl bg-[#1A2333] text-xs font-semibold text-[#F8FAFC] border border-[rgba(255,255,255,0.08)] outline-none"
            >
              <option value="P0">P0 Critical</option>
              <option value="P1">P1 Urgent</option>
              <option value="P2">P2 Normal</option>
              <option value="P3">P3 Low</option>
            </select>

            {/* Due Date */}
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="px-2.5 py-2 rounded-xl bg-[#1A2333] text-xs text-[#F8FAFC] border border-[rgba(255,255,255,0.08)] outline-none"
            />

            {/* Due Time */}
            <input
              type="time"
              value={newDueTime}
              onChange={(e) => setNewDueTime(e.target.value)}
              className="px-2.5 py-2 rounded-xl bg-[#1A2333] text-xs text-[#F8FAFC] border border-[rgba(255,255,255,0.08)] outline-none"
            />

            {/* Recurring */}
            <select
              value={newRecurring}
              onChange={(e) => setNewRecurring(e.target.value as RecurringPattern)}
              className="px-2.5 py-2 rounded-xl bg-[#1A2333] text-xs font-semibold text-[#F8FAFC] border border-[rgba(255,255,255,0.08)] outline-none"
            >
              <option value="none">No Repeat</option>
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>

            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#4F8CFF] hover:bg-[#3b82f6] shadow-md shadow-[#4F8CFF]/20 disabled:opacity-40 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>
        </div>
      </form>

      {/* Task Content: List View or Kanban Board View */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredTasks.length === 0 ? (
              <div className="rounded-3xl border border-[rgba(255,255,255,0.06)] bg-[#111827] p-12 text-center text-xs text-[#64748B]">
                No matching tasks found.
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isDone = task.status === 'completed';
                const isExpanded = expandedTaskId === task.id;

                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className={`rounded-3xl border transition-all ${
                      isDone
                        ? 'border-transparent bg-[#1A2333]/40 opacity-60'
                        : 'border-[rgba(255,255,255,0.08)] bg-[#111827] hover:border-[#4F8CFF]/40'
                    }`}
                  >
                    <div className="p-4 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                            isDone
                              ? 'bg-[#22C55E] text-black font-bold'
                              : 'border border-[rgba(255,255,255,0.2)] bg-[#1A2333] hover:border-[#4F8CFF]'
                          }`}
                        >
                          {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-semibold truncate ${
                                isDone ? 'line-through text-[#64748B]' : 'text-[#F8FAFC]'
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-xs text-[#94A3B8] mt-1">{task.description}</p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                                priorityColors[task.priority]
                              }`}
                            >
                              {task.priority}
                            </span>

                            {task.dueDate && (
                              <span className="flex items-center gap-1 text-[10px] text-[#94A3B8]">
                                <Calendar className="w-3 h-3 text-[#4F8CFF]" />
                                {task.dueDate}
                              </span>
                            )}

                            {task.dueTime && (
                              <span className="flex items-center gap-1 text-[10px] text-[#94A3B8]">
                                <Clock className="w-3 h-3 text-[#F59E0B]" />
                                {task.dueTime}
                              </span>
                            )}

                            {task.recurring && task.recurring !== 'none' && (
                              <span className="flex items-center gap-1 text-[10px] text-[#22C55E] capitalize font-medium">
                                <Repeat className="w-3 h-3" />
                                {task.recurring}
                              </span>
                            )}

                            <button
                              onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                              className="text-[10px] text-[#4F8CFF] hover:underline flex items-center gap-1 ml-1"
                            >
                              <span>{task.subtasks.length} subtasks</span>
                              <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-[#64748B] hover:text-[#EF4444] p-1.5 rounded-lg hover:bg-[#1A2333] transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Subtask Drawer */}
                    {isExpanded && (
                      <div className="p-4 border-t border-[rgba(255,255,255,0.06)] bg-[#1A2333]/50 rounded-b-3xl space-y-2">
                        <div className="space-y-1.5">
                          {task.subtasks.map((sub) => (
                            <div key={sub.id} className="flex items-center gap-2 text-xs">
                              <button
                                onClick={() => toggleSubtask(task.id, sub.id)}
                                className={`w-4 h-4 rounded flex items-center justify-center ${
                                  sub.isCompleted ? 'bg-[#22C55E] text-black' : 'border border-[rgba(255,255,255,0.2)]'
                                }`}
                              >
                                {sub.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                              </button>
                              <span className={sub.isCompleted ? 'line-through text-[#64748B]' : 'text-[#F8FAFC]'}>
                                {sub.title}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <input
                            value={subtaskInput}
                            onChange={(e) => setSubtaskInput(e.target.value)}
                            placeholder="Add subtask..."
                            className="flex-1 bg-[#111827] rounded-xl px-3 py-1.5 text-xs text-[#F8FAFC] border border-[rgba(255,255,255,0.08)] outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddSubtask(task.id)}
                            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#4F8CFF] text-white"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {(['todo', 'completed'] as TaskStatus[]).map((status) => {
            const statusTasks = filteredTasks.filter((t) => t.status === status);
            const statusLabels = {
              todo: { label: 'To Do Queue', color: '#4F8CFF' },
              completed: { label: 'Completed', color: '#22C55E' },
            };

            return (
              <div key={status} className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-5 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.06)] mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusLabels[status].color }} />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
                      {statusLabels[status].label}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#1A2333] text-[#94A3B8]">
                    {statusTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {statusTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskStatus(task.id)}
                      className="p-3.5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#1A2333] hover:border-[#4F8CFF]/40 cursor-pointer transition-all"
                    >
                      <h4 className={`text-xs font-semibold ${task.status === 'completed' ? 'line-through text-[#64748B]' : 'text-[#F8FAFC]'}`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[rgba(255,255,255,0.05)] text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded font-bold ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        {task.dueTime && <span className="text-[#94A3B8]">{task.dueTime}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskSystemView;
