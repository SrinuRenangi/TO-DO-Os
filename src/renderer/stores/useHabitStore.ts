import { create } from 'zustand';
import { Habit } from '@shared/types';
import { getTodayDateString, generateId } from '@/lib/utils';
import { soundSynth } from '@/lib/sound-synth';

interface HabitState {
  habits: Habit[];
  toggleHabitToday: (id: string) => void;
  addHabit: (title: string, icon?: string, color?: string) => void;
  deleteHabit: (id: string) => void;
}

const today = getTodayDateString();

const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    title: 'Morning Deep Meditation & Breathwork',
    icon: 'Sun',
    color: '#007AFF',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    currentStreak: 14,
    longestStreak: 28,
    completedDates: [today],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'habit-2',
    title: '90-Minute Unbroken Deep Work Block',
    icon: 'Zap',
    color: '#8B5CF6',
    frequency: 'weekdays',
    targetDaysPerWeek: 5,
    currentStreak: 8,
    longestStreak: 21,
    completedDates: [today],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'habit-3',
    title: '10,000 Steps Daily Movement',
    icon: 'Footprints',
    color: '#22C55E',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    currentStreak: 22,
    longestStreak: 30,
    completedDates: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'habit-4',
    title: 'Read 20 Pages of Philosophy / Science',
    icon: 'BookOpen',
    color: '#F59E0B',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    currentStreak: 6,
    longestStreak: 15,
    completedDates: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useHabitStore = create<HabitState>((set) => ({
  habits: INITIAL_HABITS,

  toggleHabitToday: (id) => {
    const currentDate = getTodayDateString();
    set((state) => ({
      habits: state.habits.map((habit) => {
        if (habit.id !== id) return habit;

        const isCompletedToday = habit.completedDates.includes(currentDate);
        let nextCompletedDates: string[];
        let nextStreak: number;

        if (isCompletedToday) {
          nextCompletedDates = habit.completedDates.filter((d) => d !== currentDate);
          nextStreak = Math.max(0, habit.currentStreak - 1);
        } else {
          nextCompletedDates = [...habit.completedDates, currentDate];
          nextStreak = habit.currentStreak + 1;
          soundSynth.playChime('complete');
        }

        return {
          ...habit,
          completedDates: nextCompletedDates,
          currentStreak: nextStreak,
          longestStreak: Math.max(habit.longestStreak, nextStreak),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  addHabit: (title, icon = 'Zap', color = '#007AFF') => {
    const newHabit: Habit = {
      id: generateId('habit'),
      title,
      icon,
      color,
      frequency: 'daily',
      targetDaysPerWeek: 7,
      currentStreak: 0,
      longestStreak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ habits: [...state.habits, newHabit] }));
  },

  deleteHabit: (id) => {
    set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }));
  },
}));
