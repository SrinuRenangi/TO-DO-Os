import React from 'react';
import { motion } from 'framer-motion';
import { AppModuleId, MODULE_REGISTRY } from '@/stores/useAppStore';
import { 
  CheckSquare, FileText, Flame, Target, Clock, Calendar, Bell, 
  BarChart2, Calculator, Sparkles, Settings, ArrowLeft 
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';

interface ModuleViewProps {
  moduleId: AppModuleId;
}

export const ModulePlaceholderView: React.FC<ModuleViewProps> = ({ moduleId }) => {
  const { setActiveModule } = useAppStore();
  const meta = MODULE_REGISTRY.find((m) => m.id === moduleId);

  const icons: Record<string, React.ReactNode> = {
    tasks: <CheckSquare className="w-8 h-8 text-[#007AFF]" />,
    notes: <FileText className="w-8 h-8 text-[#8B5CF6]" />,
    habits: <Flame className="w-8 h-8 text-[#F59E0B]" />,
    goals: <Target className="w-8 h-8 text-[#EF4444]" />,
    focus: <Clock className="w-8 h-8 text-[#8B5CF6]" />,
    calendar: <Calendar className="w-8 h-8 text-[#007AFF]" />,
    reminders: <Bell className="w-8 h-8 text-[#F59E0B]" />,
    analytics: <BarChart2 className="w-8 h-8 text-[#22C55E]" />,
    calculator: <Calculator className="w-8 h-8 text-[#007AFF]" />,
    ai: <Sparkles className="w-8 h-8 text-[#8B5CF6]" />,
    settings: <Settings className="w-8 h-8 text-[#94A3B8]" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="max-w-4xl mx-auto p-8"
    >
      <button
        onClick={() => setActiveModule('dashboard')}
        className="flex items-center gap-2 mb-6 text-xs font-semibold text-[#64748B] hover:text-[#007AFF] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </button>

      <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#151922] p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-2xl bg-[#1D2330] border border-[rgba(255,255,255,0.08)]">
            {icons[moduleId] || <CheckSquare className="w-8 h-8 text-[#007AFF]" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F8FAFC]">{meta?.name || moduleId}</h1>
            <p className="text-xs text-[#94A3B8]">{meta?.description}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.06)] space-y-4">
          <div className="p-4 rounded-2xl bg-[#1D2330]/60 border border-[rgba(255,255,255,0.06)] flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#F8FAFC]">Module Status</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Connected to SQLite local database engine. Ready for full feature expansion in Phase 2.
              </p>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30">
              Active Spec
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#1D2330] border border-[rgba(255,255,255,0.06)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Latency</span>
              <p className="text-xl font-bold text-[#F8FAFC] mt-1">0.4ms</p>
              <span className="text-[10px] text-[#22C55E]">In-memory cached</span>
            </div>
            <div className="p-4 rounded-xl bg-[#1D2330] border border-[rgba(255,255,255,0.06)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Engine</span>
              <p className="text-xl font-bold text-[#F8FAFC] mt-1">Local SQLite</p>
              <span className="text-[10px] text-[#007AFF]">Offline Durable</span>
            </div>
            <div className="p-4 rounded-xl bg-[#1D2330] border border-[rgba(255,255,255,0.06)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Security</span>
              <p className="text-xl font-bold text-[#F8FAFC] mt-1">Sandbox</p>
              <span className="text-[10px] text-[#8B5CF6]">Context Isolated</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
