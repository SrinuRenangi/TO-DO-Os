import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock, AlertCircle, Check, RotateCcw, Volume2, Plus, VolumeX, Sparkles } from 'lucide-react';
import { useReminderStore } from '@/stores/useReminderStore';
import { soundSynth } from '@/lib/sound-synth';
import { notificationService } from '@/services/notifications/notification-service';

export const NotificationCenterView: React.FC = () => {
  const { reminders, snoozeReminder, dismissReminder, addReminder } = useReminderStore();
  const [newTitle, setNewTitle] = useState('');
  const [newDueTime, setNewDueTime] = useState('18:00');
  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'critical'>('urgent');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const [hours, mins] = newDueTime.split(':').map(Number);
    const target = new Date();
    target.setHours(hours, mins, 0, 0);

    // If time is earlier today, set for tomorrow
    if (target.getTime() < Date.now()) {
      target.setDate(target.getDate() + 1);
    }

    const timeFormatted = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(target);

    addReminder(newTitle.trim(), target.toISOString(), timeFormatted, urgency);
    setNewTitle('');
  };

  const handleTestChime = () => {
    notificationService.dispatch({
      title: 'Personal OS Test Alert',
      body: '24/7 background scheduler and audio chime are operating nominally.',
      urgency: 'urgent',
      sound: true,
    });
  };

  const urgencyStyles = {
    normal: 'border-[#4F8CFF]/30 bg-[#4F8CFF]/10 text-[#4F8CFF]',
    urgent: 'border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B]',
    critical: 'border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444]',
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#F59E0B]/15 text-[#F59E0B]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">24/7 Reminder Engine</h1>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Native Windows notifications and sound alerts that trigger even when the window is closed.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleTestChime}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#1A2333] hover:bg-[#21293C] text-[#F8FAFC] border border-[rgba(255,255,255,0.08)] transition-all"
        >
          <Volume2 className="w-4 h-4 text-[#F59E0B]" />
          <span>Test Audio Chime</span>
        </button>
      </div>

      {/* Add Reminder Card */}
      <form
        onSubmit={handleAdd}
        className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-5 shadow-xl flex flex-col md:flex-row items-center gap-3"
      >
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Reminder title (e.g. Buy Medicine & Prescription Refill)..."
          className="flex-1 w-full bg-[#1A2333] text-xs text-[#F8FAFC] placeholder-[#64748B] outline-none px-3.5 py-2.5 rounded-xl border border-[rgba(255,255,255,0.08)] focus:border-[#4F8CFF]/60"
        />

        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="time"
            value={newDueTime}
            onChange={(e) => setNewDueTime(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1A2333] text-xs text-[#F8FAFC] outline-none"
          />

          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1A2333] text-xs text-[#F8FAFC] outline-none"
          >
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
            <option value="critical">Critical (P0)</option>
          </select>

          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#4F8CFF] hover:bg-[#3b82f6] shadow-md shadow-[#4F8CFF]/20 disabled:opacity-40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Set Reminder</span>
          </button>
        </div>
      </form>

      {/* Reminders Feed */}
      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="rounded-3xl border border-[rgba(255,255,255,0.06)] bg-[#111827] p-12 text-center text-xs text-[#64748B]">
            No reminders scheduled. Set a reminder above (e.g. "Buy Medicine" at 6:00 PM) to test 24/7 alerting.
          </div>
        ) : (
          reminders.map((rem) => (
            <div
              key={rem.id}
              className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl border ${urgencyStyles[rem.urgency]}`}>
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F8FAFC]">{rem.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#94A3B8]">
                    <span className="font-semibold text-[#4F8CFF]">{rem.dueTimeFormatted}</span>
                    <span>• Priority: <span className="capitalize font-medium">{rem.urgency}</span></span>
                    {rem.isSnoozed && <span className="text-[#F59E0B] font-semibold">(Snoozed)</span>}
                    {rem.isTriggered && <span className="text-[#EF4444] font-semibold">(Triggered)</span>}
                  </div>
                </div>
              </div>

              {/* Snooze & Complete Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => snoozeReminder(rem.id, 15)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1A2333] text-[#94A3B8] hover:text-[#F8FAFC] border border-[rgba(255,255,255,0.06)] transition-all"
                >
                  +15m
                </button>
                <button
                  onClick={() => snoozeReminder(rem.id, 60)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1A2333] text-[#94A3B8] hover:text-[#F8FAFC] border border-[rgba(255,255,255,0.06)] transition-all"
                >
                  +1h
                </button>
                <button
                  onClick={() => dismissReminder(rem.id)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#22C55E] text-black hover:bg-[#16a34a] shadow-md transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Done</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenterView;
