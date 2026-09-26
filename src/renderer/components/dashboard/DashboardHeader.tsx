import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Command, Plus, Zap, ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useFocusStore } from '@/stores/useFocusStore';
import { useProductivityScore } from '@/hooks/useProductivityScore';
import { formatDisplayDate } from '@/lib/utils';

export const DashboardHeader: React.FC = () => {
  const { setCommandPaletteOpen, setQuickCaptureOpen } = useAppStore();
  const { startTimer, isRunning } = useFocusStore();
  const { score, label, tasksCompleted, tasksTotal, habitsCompleted, habitsTotal } = useProductivityScore();
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { weekday, monthDay, weekNumber } = formatDisplayDate(currentTime);
  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Dynamic greeting
  const hour = currentTime.getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';

  // SVG Gauge math
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative mb-6 rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#151922]/90 backdrop-blur-xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Greeting & Date */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              Local Engine Active
            </span>
            <span className="text-xs text-[#64748B]">
              {weekday}, {monthDay} • Week {weekNumber}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F8FAFC]">
            {greeting}, <span className="text-[#007AFF]">Sri</span>
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Your system is synchronized. You have {tasksTotal - tasksCompleted} tasks remaining and {habitsTotal - habitsCompleted} habits left today.
          </p>
        </div>

        {/* Center: Real-time Live Chrono */}
        <div className="hidden lg:flex flex-col items-center px-6 py-2 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#1D2330]/70">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-[#64748B]">Current Time</span>
          <span className="text-2xl font-mono font-bold tracking-wider text-[#F8FAFC] tabular-nums">
            {timeString}
          </span>
        </div>

        {/* Right: Productivity Index Gauge & Quick Actions */}
        <div className="flex items-center gap-5">
          {/* Productivity Gauge */}
          <div className="flex items-center gap-3 pr-4 border-r border-[rgba(255,255,255,0.08)]">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28"
                  cy="28"
                  r={radius}
                  className="stroke-[#1D2330]"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="28"
                  cy="28"
                  r={radius}
                  stroke="#007AFF"
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xs font-bold text-[#F8FAFC] tabular-nums">{score}%</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">Productivity Index</div>
              <div className="text-xs font-bold text-[#007AFF]">{label}</div>
            </div>
          </div>

          {/* Action Trio */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuickCaptureOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0062CC] shadow-lg shadow-[#007AFF]/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Capture (⌘N)</span>
            </button>

            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] bg-[#1D2330] hover:bg-[#242B3B] border border-[rgba(255,255,255,0.08)] transition-all"
            >
              <Command className="w-3.5 h-3.5" />
              <span>Omni (⌘K)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
