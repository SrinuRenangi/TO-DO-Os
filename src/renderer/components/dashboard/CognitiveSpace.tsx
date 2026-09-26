import React from 'react';
import { motion } from 'framer-motion';
import { FileEdit, ArrowRight, Save, Trash2, Sparkles, Database, Check, BarChart2 } from 'lucide-react';
import { useNotesStore } from '@/stores/useNotesStore';
import { useProductivityScore } from '@/hooks/useProductivityScore';

export const CognitiveSpace: React.FC = () => {
  const { scratchpad, setScratchpad, convertScratchpadToTask, saveScratchpadAsNote, clearScratchpad } = useNotesStore();
  const { score, tasksCompleted, habitsCompleted } = useProductivityScore();

  // 7-day velocity mock/real data
  const velocityDays = [
    { day: 'M', completed: 8, height: '65%' },
    { day: 'T', completed: 11, height: '90%' },
    { day: 'W', completed: 6, height: '50%' },
    { day: 'T', completed: 10, height: '80%' },
    { day: 'F', completed: 9, height: '75%' },
    { day: 'S', completed: tasksCompleted + habitsCompleted, height: `${Math.min(100, (tasksCompleted + habitsCompleted) * 12)}%`, active: true },
    { day: 'S', completed: 0, height: '10%' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Notion / Obsidian Instant Scratchpad */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#151922] p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-[#007AFF]/15 text-[#007AFF]">
              <FileEdit className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Cognitive Scratchpad
            </h3>
          </div>
          <span className="text-[10px] text-[#22C55E] font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" /> Auto-saved
          </span>
        </div>

        <textarea
          value={scratchpad}
          onChange={(e) => setScratchpad(e.target.value)}
          placeholder="Jot fleeting thoughts, architectural ideas, or meeting notes..."
          rows={5}
          className="w-full rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#1D2330] p-3 text-xs text-[#F8FAFC] placeholder-[#64748B] outline-none focus:border-[#007AFF] resize-none font-mono transition-all"
        />

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[rgba(255,255,255,0.06)]">
          <button
            onClick={clearScratchpad}
            className="p-1.5 text-[#64748B] hover:text-[#EF4444] rounded-lg hover:bg-[#1D2330] transition-all"
            title="Clear buffer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={saveScratchpadAsNote}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#94A3B8] hover:text-[#F8FAFC] bg-[#1D2330] hover:bg-[#242B3B] rounded-lg border border-[rgba(255,255,255,0.08)] transition-all"
            >
              <Save className="w-3 h-3" />
              <span>Save Note</span>
            </button>

            <button
              onClick={convertScratchpadToTask}
              className="flex items-center gap-1 px-3 py-1 text-[11px] font-semibold text-white bg-[#007AFF] hover:bg-[#0062CC] rounded-lg shadow-sm transition-all"
            >
              <ArrowRight className="w-3 h-3" />
              <span>Convert to Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 7-Day Velocity Chart */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#151922] p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-[#22C55E]/15 text-[#22C55E]">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              7-Day Velocity
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-[#22C55E]">+18% vs last week</span>
        </div>

        <div className="flex items-end justify-between h-24 pt-4 px-2">
          {velocityDays.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full flex justify-center h-16 items-end">
                <div
                  style={{ height: item.height }}
                  className={`w-4 rounded-t-md transition-all duration-500 ${
                    item.active
                      ? 'bg-[#007AFF] shadow-lg shadow-[#007AFF]/30'
                      : 'bg-[#1D2330] hover:bg-[#242B3B]'
                  }`}
                  title={`${item.completed} items`}
                />
              </div>
              <span
                className={`text-[10px] font-semibold ${
                  item.active ? 'text-[#007AFF]' : 'text-[#64748B]'
                }`}
              >
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Ambient AI Intelligence Briefing */}
      <div className="rounded-2xl border border-[#8B5CF6]/30 bg-gradient-to-b from-[#8B5CF6]/10 to-transparent p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1 rounded-md bg-[#8B5CF6]/20 text-[#8B5CF6]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-bold text-[#F8FAFC]">AI Life OS Briefing</h4>
        </div>
        <p className="text-[11px] text-[#94A3B8] leading-relaxed">
          High cognitive flow detected today. You have finished your core P0 task and logged 95 minutes of deep focus. Next recommended focus window begins at 16:00.
        </p>
      </div>

      {/* 4. SQLite System Heartbeat */}
      <div className="p-3.5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#10131A] flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2 text-[#94A3B8]">
          <Database className="w-3.5 h-3.5 text-[#007AFF]" />
          <span>Better-SQLite3 WAL Engine</span>
        </div>
        <span className="text-[#22C55E] font-medium flex items-center gap-1">
          <Check className="w-3 h-3" /> Offline-First
        </span>
      </div>
    </div>
  );
};
