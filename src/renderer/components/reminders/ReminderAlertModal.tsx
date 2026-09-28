// ============================================================================
// Personal OS — Dedicated Reminder Alert Modal (Alarm Window System)
// High-visibility alarm modal with large action buttons & comprehensive snooze
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Clock,
  CheckCircle2,
  X,
  Flame,
  Zap,
  Target,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useReminderStore } from '@/stores/useReminderStore';
import { Reminder } from '@shared/types';
import { useTaskStore } from '@/stores/useTaskStore';
import { soundSynth } from '@/lib/sound-synth';
import { settingsService } from '@/services/settings/settings-service';

export interface ActiveAlertPayload {
  id: string;
  title: string;
  message?: string;
  time?: string;
  urgency?: 'normal' | 'urgent' | 'critical';
  taskId?: string;
  reminder?: Reminder;
}

export const ReminderAlertModal: React.FC = () => {
  const { reminders, snoozeReminder, dismissReminder } = useReminderStore();
  const { tasks, toggleTaskStatus } = useTaskStore();

  const [activeAlert, setActiveAlert] = useState<ActiveAlertPayload | null>(null);
  const [alertQueue, setAlertQueue] = useState<ActiveAlertPayload[]>([]);
  const [showCustomSnooze, setShowCustomSnooze] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('20');
  const [isMuted, setIsMuted] = useState(false);

  // 1. Listen for native IPC reminder alerts from main process
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).desktopNotifications?.onReminderAlertTriggered) {
      const unsubscribe = (window as any).desktopNotifications.onReminderAlertTriggered((data: any) => {
        const payload: ActiveAlertPayload = {
          id: data.id || `rem-${Date.now()}`,
          title: data.title || 'Scheduled Reminder',
          message: data.message || 'It is time for your scheduled task.',
          urgency: data.urgency || 'normal',
          taskId: data.taskId,
        };
        triggerAlert(payload);
      });
      return () => unsubscribe();
    }
  }, []);

  // 2. Continuous monitor of store triggered reminders that are not yet dismissed/snoozed
  useEffect(() => {
    const unhandled = reminders.filter(
      (r) => r.isTriggered && !r.isSnoozed && (r as any).status !== 'dismissed'
    );

    if (unhandled.length > 0 && !activeAlert) {
      const top = unhandled[0];
      const payload: ActiveAlertPayload = {
        id: top.id,
        title: top.title,
        message: `Scheduled for ${top.dueTimeFormatted || 'now'}. Take action or snooze.`,
        time: top.dueTimeFormatted,
        urgency: top.urgency,
        taskId: top.taskId,
        reminder: top,
      };
      triggerAlert(payload);
    }
  }, [reminders, activeAlert]);

  const triggerAlert = (payload: ActiveAlertPayload) => {
    setActiveAlert((current) => {
      if (!current) {
        // Play configured reminder sound
        const settings = settingsService.getSettings();
        if (settings.soundEnabled && !isMuted) {
          soundSynth.playAlertSound(settings.reminderSound || 'bell');
        }
        return payload;
      }
      // Add to queue if another is already open
      setAlertQueue((q) => (q.some((x) => x.id === payload.id) ? q : [...q, payload]));
      return current;
    });
  };

  const handleDismiss = () => {
    if (!activeAlert) return;
    dismissReminder(activeAlert.id);
    advanceQueue();
  };

  const handleMarkComplete = () => {
    if (!activeAlert) return;
    if (activeAlert.taskId) {
      const task = tasks.find((t) => t.id === activeAlert.taskId);
      if (task && task.status !== 'completed') {
        toggleTaskStatus(activeAlert.taskId);
      }
    }
    soundSynth.playChime('complete');
    dismissReminder(activeAlert.id);
    advanceQueue();
  };

  const handleSnooze = (minutes: number) => {
    if (!activeAlert) return;
    snoozeReminder(activeAlert.id, minutes);
    advanceQueue();
  };

  const handleCustomSnoozeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customMinutes, 10);
    if (!isNaN(mins) && mins > 0) {
      handleSnooze(mins);
      setShowCustomSnooze(false);
    }
  };

  const advanceQueue = () => {
    setShowCustomSnooze(false);
    if (alertQueue.length > 0) {
      const [next, ...rest] = alertQueue;
      setAlertQueue(rest);
      setActiveAlert(next);
      const settings = settingsService.getSettings();
      if (settings.soundEnabled && !isMuted) {
        soundSynth.playAlertSound(settings.reminderSound || 'bell');
      }
    } else {
      setActiveAlert(null);
    }
  };

  if (!activeAlert) return null;

  const linkedTask = activeAlert.taskId ? tasks.find((t) => t.id === activeAlert.taskId) : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border-2 border-blue-500 overflow-hidden"
        >
          {/* Top Banner Alert Strip */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/20 text-white animate-bounce">
                <Bell className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight">REMINDER ALARM</h3>
                <p className="text-[11px] text-blue-100 font-medium">Scheduled Alert Triggered</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title={isMuted ? 'Unmute' : 'Mute Sound'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                {activeAlert.urgency === 'critical' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                    <Flame className="w-3 h-3 text-rose-600 fill-rose-500" />
                    <span>Critical Alert</span>
                  </span>
                ) : activeAlert.urgency === 'urgent' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                    <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
                    <span>Urgent Alert</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300">
                    <Target className="w-3 h-3 text-blue-600" />
                    <span>Scheduled Reminder</span>
                  </span>
                )}
                {activeAlert.time && (
                  <span className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {activeAlert.time}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-black text-slate-900 leading-snug">
                {activeAlert.title.replace(/^Personal OS Reminder:\s*/i, '').replace(/^Reminder:\s*/i, '')}
              </h2>

              {activeAlert.message && (
                <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                  {activeAlert.message}
                </p>
              )}

              {linkedTask && linkedTask.dueDate && (
                <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2 font-medium">
                  <span className="font-bold text-slate-900">Task Category:</span> {linkedTask.category}
                  <span className="text-slate-300">•</span>
                  <span className="font-bold text-slate-900">Due:</span> {linkedTask.dueDate} {linkedTask.dueTime || ''}
                </div>
              )}
            </div>

            {/* Large Primary Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMarkComplete}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Mark Complete</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDismiss}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm border border-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Dismiss</span>
              </motion.button>
            </div>

            {/* Snooze Presets Section */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                  Snooze Options
                </span>
                <button
                  onClick={() => setShowCustomSnooze(!showCustomSnooze)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                >
                  {showCustomSnooze ? 'Preset Times' : 'Custom Minutes'}
                </button>
              </div>

              {!showCustomSnooze ? (
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '5 Min', mins: 5 },
                    { label: '10 Min', mins: 10 },
                    { label: '15 Min', mins: 15 },
                    { label: '30 Min', mins: 30 },
                  ].map((preset) => (
                    <motion.button
                      key={preset.mins}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleSnooze(preset.mins)}
                      className="py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs transition-colors"
                    >
                      {preset.label}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleCustomSnoozeSubmit} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value)}
                      placeholder="Minutes"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <span className="absolute right-3 top-2 text-xs font-semibold text-slate-400 pointer-events-none">
                      min
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
                  >
                    Snooze
                  </button>
                </form>
              )}
            </div>

            {/* Queue Indicator if multiple alarms are waiting */}
            {alertQueue.length > 0 && (
              <div className="text-center text-[11px] font-bold text-amber-700 bg-amber-50 py-1.5 px-3 rounded-lg border border-amber-200">
                +{alertQueue.length} more alarm{alertQueue.length > 1 ? 's' : ''} waiting in queue
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
