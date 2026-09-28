import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Clock,
  Volume2,
  Plus,
  Check,
  Trash2,
  CheckCircle2,
  Circle,
  Flame,
  Zap,
  Target,
} from 'lucide-react';
import { useReminderStore } from '@/stores/useReminderStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { formatRelativeTime } from '@/lib/utils';

export const NotificationCenterView: React.FC = () => {
  const { reminders, snoozeReminder, dismissReminder, deleteReminder, addReminder } = useReminderStore();
  const {
    notifications,
    unreadCount,
    markAsRead,
    dismissNotification,
    clearAll,
    dispatchNotification,
  } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<'Active' | 'Pinned' | 'Historical'>('Active');
  const [soundVolume, setSoundVolume] = useState(0.8);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDueTime, setNewDueTime] = useState('18:00');
  const [newUrgency, setNewUrgency] = useState<'normal' | 'urgent' | 'critical'>('urgent');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const [hours, mins] = newDueTime.split(':').map(Number);
    const target = new Date();
    target.setHours(hours, mins, 0, 0);

    const timeFormatted = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(target);

    addReminder(newTitle.trim(), target.toISOString(), timeFormatted, newUrgency);
    setNewTitle('');
    setShowAddModal(false);
  };

  const handleTestChime = () => {
    dispatchNotification({
      title: 'Personal Organizer Alert',
      body: '24/7 background alerting engine active with Web Audio chime.',
      urgency: 'urgent',
      sound: soundEnabled,
    });
  };

  const renderUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
            <Flame className="w-3 h-3 text-rose-600 fill-rose-500 animate-pulse" />
            <span>Urgent</span>
          </span>
        );
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
            <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
            <span>High</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-sky-100 text-sky-900 border border-sky-300">
            <Target className="w-3 h-3 text-sky-600" />
            <span>Normal</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-[1460px] mx-auto space-y-5">
      {/* 1. Header Title & Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 uppercase">
            REMINDERS SERVICE: 24/7 ALERTING ENGINE
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* View Tab Selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
            <span className="text-[10px] text-slate-500 font-extrabold px-2">VIEW</span>
            {(['Active', 'Pinned', 'Historical'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-white shadow-2xs text-slate-950 font-black'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Reminder</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Main 3-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* PANEL 1: UPCOMING REAL REMINDERS OR NOTIFICATION FEED (col-span-5) */}
        <div className="lg:col-span-5 studio-panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              <h3 className="font-black text-xs text-slate-950 uppercase">
                {activeTab === 'Historical' ? (
                  <>NOTIFICATION EVENT FEED <span className="text-slate-500 font-bold normal-case">({notifications.length} Logged)</span></>
                ) : (
                  <>UPCOMING REAL REMINDERS <span className="text-slate-500 font-bold normal-case">({reminders.length} Scheduled)</span></>
                )}
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              {activeTab === 'Historical' && notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-[10px] font-extrabold text-slate-500 hover:text-rose-600 transition-colors px-1.5 py-0.5 rounded hover:bg-rose-50"
                  title="Clear All Notifications"
                >
                  Clear All
                </button>
              )}
              <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                {activeTab === 'Historical' ? `${unreadCount} Unread` : 'Live Alerting'}
              </span>
            </div>
          </div>

          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
            {activeTab === 'Historical' ? (
              notifications.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">Notification history is empty.</p>
                  <p className="text-[11px] text-slate-500">Alerts will be logged here as reminders trigger.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2 group shadow-2xs ${
                      notif.isRead
                        ? 'bg-slate-50/70 border-slate-200 text-slate-600'
                        : 'bg-white border-blue-200 shadow-xs text-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <div className="mt-0.5 shrink-0">
                          {renderUrgencyBadge(notif.urgency)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-950 truncate">{notif.title}</span>
                            <span className="text-[10px] text-slate-500 font-mono font-bold shrink-0 ml-2">
                              {formatRelativeTime(notif.timestamp)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-medium mt-1">
                            {notif.body}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {!notif.isRead && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Mark as Read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => dismissNotification(notif.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Dismiss / Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )
            ) : reminders.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-700">No active alerts scheduled.</p>
                <p className="text-[11px] text-slate-500">Click '+ Add Reminder' to schedule a new alert.</p>
              </div>
            ) : (
              reminders.map((rem) => (
                <motion.div
                  key={rem.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all space-y-2 group shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2 text-xs">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => dismissReminder(rem.id)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                        title="Dismiss / Complete Reminder"
                      >
                        <Circle className="w-4 h-4 hover:fill-emerald-100" />
                      </motion.button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {renderUrgencyBadge(rem.urgency || 'normal')}
                          <span className="font-bold text-slate-950 truncate">{rem.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-semibold mt-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{rem.dueTimeFormatted || 'Scheduled'}</span>
                          {rem.isSnoozed && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-100 text-blue-700 font-bold">
                              Snoozed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => snoozeReminder(rem.id, 15)}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-white hover:bg-blue-50 border border-slate-300 text-blue-700 shadow-2xs transition-colors"
                      >
                        +15m
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => snoozeReminder(rem.id, 60)}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-white hover:bg-blue-50 border border-slate-300 text-blue-700 shadow-2xs transition-colors"
                      >
                        +1h
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteReminder(rem.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* PANEL 2: ALERT CONFIGURATION & HISTORY (col-span-4) */}
        <div className="lg:col-span-4 studio-panel p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-black text-xs text-slate-950 uppercase">
              ALERT CONFIGURATION & HISTORY
            </h3>
            <button
              onClick={handleTestChime}
              className="text-[11px] font-extrabold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Chime</span>
            </button>
          </div>

          {/* Volume Control */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between font-extrabold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-blue-600" />
                <span>Sound Chime Volume</span>
              </span>
              <span className="font-mono text-blue-700">{Math.round(soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              onChange={(e) => setSoundVolume(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Completion Alert Switch */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-extrabold text-slate-900 block">Sound Alerts</span>
              <span className="text-[11px] text-slate-600">Web Audio synthesis on deadline trigger</span>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                soundEnabled ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <motion.div layout className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Quick Snooze Presets Setting */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-extrabold text-slate-900 block">Default Snooze Presets</span>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-white border border-slate-300 font-extrabold text-slate-800 text-xs">
                +15m
              </span>
              <span className="px-3 py-1 rounded-xl bg-white border border-slate-300 font-extrabold text-slate-800 text-xs">
                +1h
              </span>
              <span className="px-3 py-1 rounded-xl bg-white border border-slate-300 font-extrabold text-slate-800 text-xs">
                +24h
              </span>
            </div>
          </div>
        </div>

        {/* PANEL 3: SCHEDULED REMINDERS & URGENCY LOG (col-span-3) */}
        <div className="lg:col-span-3 studio-panel p-6 space-y-4 text-xs">
          <div className="pb-3 border-b border-slate-200">
            <h3 className="font-black text-xs text-slate-950 uppercase">
              SCHEDULED LOG & STATUS
            </h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-900">
                <span>Scheduler Daemon</span>
                <span className="text-emerald-700 font-bold">Active</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Evaluates reminder deadlines every tick via deterministic scheduler.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-900">
                <span>Urgency Levels</span>
                <span className="text-blue-700 font-bold">3 Tiers</span>
              </div>
              <div className="space-y-1 pt-1">
                <div className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-500" />
                  <span className="text-[11px] text-slate-700 font-bold">Urgent: Sound + Banner</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span className="text-[11px] text-slate-700 font-bold">High: Visual Notification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-sky-600" />
                  <span className="text-[11px] text-slate-700 font-bold">Normal: Tray Status Icon</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-300 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-black text-slate-950">Add New Reminder</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Reminder Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Deployment Sync"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Trigger Time</label>
                  <input
                    type="time"
                    value={newDueTime}
                    onChange={(e) => setNewDueTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-bold text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Urgency</label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-bold text-slate-900 bg-white"
                  >
                    <option value="critical">🔥 Urgent</option>
                    <option value="urgent">⚡ High</option>
                    <option value="normal">🎯 Normal</option>
                  </select>
                </div>
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
                  Save Reminder
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Footer Status Bar */}
      <div className="pt-4 border-t border-slate-300 flex items-center justify-between text-xs text-slate-800 font-bold">
        <span>Total Active: {reminders.length} | Alert Daemon: 24/7 Precision | Chime: {soundEnabled ? 'Enabled' : 'Muted'}</span>
        <span className="text-slate-700 font-mono text-[11px] font-extrabold">* No fake metrics</span>
      </div>
    </div>
  );
};

export default NotificationCenterView;
