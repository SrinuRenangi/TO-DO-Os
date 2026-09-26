import { useMemo } from 'react';
import { useTaskStore } from '@/stores/useTaskStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { useFocusStore } from '@/stores/useFocusStore';
import { getTodayDateString } from '@/lib/utils';

export interface ProductivityMetrics {
  score: number;
  label: string;
  tasksCompleted: number;
  tasksTotal: number;
  habitsCompleted: number;
  habitsTotal: number;
  focusMinutes: number;
}

export function useProductivityScore(): ProductivityMetrics {
  const tasks = useTaskStore((state) => state.tasks);
  const habits = useHabitStore((state) => state.habits);
  const totalFocusMinutesToday = useFocusStore((state) => state.totalFocusMinutesToday);

  return useMemo(() => {
    const today = getTodayDateString();
    
    // Task ratio
    const tasksTotal = tasks.length;
    const tasksCompleted = tasks.filter((t) => t.status === 'completed').length;
    const taskRatio = tasksTotal > 0 ? tasksCompleted / tasksTotal : 0.8;

    // Habit ratio
    const habitsTotal = habits.length;
    const habitsCompleted = habits.filter((h) => h.completedDates.includes(today)).length;
    const habitRatio = habitsTotal > 0 ? habitsCompleted / habitsTotal : 0.7;

    // Focus ratio (target: 90 minutes deep work daily)
    const targetFocus = 90;
    const focusRatio = Math.min(1.0, totalFocusMinutesToday / targetFocus);

    // Weighted formula: 40% tasks + 30% habits + 20% focus + 10% base
    const rawScore = Math.round((taskRatio * 40) + (habitRatio * 30) + (focusRatio * 20) + 10);
    const score = Math.max(10, Math.min(100, rawScore));

    let label = 'Building Momentum';
    if (score >= 90) label = 'Apex Flow State';
    else if (score >= 75) label = 'High Velocity';
    else if (score >= 50) label = 'Deep Focus';

    return {
      score,
      label,
      tasksCompleted,
      tasksTotal,
      habitsCompleted,
      habitsTotal,
      focusMinutes: totalFocusMinutesToday,
    };
  }, [tasks, habits, totalFocusMinutesToday]);
}
