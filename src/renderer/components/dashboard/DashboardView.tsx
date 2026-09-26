import React from 'react';
import { DashboardHeader } from './DashboardHeader';
import { ExecutionHub } from './ExecutionHub';
import { TemporalEngine } from './TemporalEngine';
import { CognitiveSpace } from './CognitiveSpace';

export const DashboardView: React.FC = () => {
  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      {/* OS Header Strip */}
      <DashboardHeader />

      {/* The 3-Zone Master Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Zone A: Execution Hub (Tasks, Priorities, Habits) - 5 Cols */}
        <div className="lg:col-span-5 space-y-6">
          <ExecutionHub />
        </div>

        {/* Zone B: Temporal & Focus Engine (Timer, Timeline) - 4 Cols */}
        <div className="lg:col-span-4 space-y-6">
          <TemporalEngine />
        </div>

        {/* Zone C: Cognitive Space (Scratchpad, Velocity, Intelligence) - 3 Cols */}
        <div className="lg:col-span-3 space-y-6">
          <CognitiveSpace />
        </div>
      </div>
    </div>
  );
};
