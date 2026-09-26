import { create } from 'zustand';
import { CalendarEvent } from '@shared/types';
import { generateId } from '@/lib/utils';

interface CalendarState {
  events: CalendarEvent[];
  addEvent: (title: string, startTime: string, endTime: string, category?: CalendarEvent['category'], color?: string) => void;
  deleteEvent: (id: string) => void;
}

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Executive Architecture Review (Personal OS)',
    description: 'System-wide evaluation of offline-first SQLite durability and Raycast UI latency.',
    startTime: '10:00',
    endTime: '11:00',
    isAllDay: false,
    category: 'meeting',
    color: '#007AFF',
  },
  {
    id: 'evt-2',
    title: 'Unbroken Deep Work: Audio Synthesizer & Canvas',
    description: 'Zero distraction block reserved for high-velocity coding.',
    startTime: '13:00',
    endTime: '14:30',
    isAllDay: false,
    category: 'timeblock',
    color: '#8B5CF6',
  },
  {
    id: 'evt-3',
    title: 'Apple Human Interface Polish & Motion Tuning',
    description: 'Fine-tune 150ms spring physics, glassmorphism boundaries, and dark mode tokens.',
    startTime: '16:00',
    endTime: '17:00',
    isAllDay: false,
    category: 'event',
    color: '#22C55E',
  },
];

export const useCalendarStore = create<CalendarState>((set) => ({
  events: INITIAL_EVENTS,

  addEvent: (title, startTime, endTime, category = 'event', color = '#007AFF') => {
    const newEvent: CalendarEvent = {
      id: generateId('evt'),
      title,
      startTime,
      endTime,
      isAllDay: false,
      category,
      color,
    };
    set((state) => ({ events: [...state.events, newEvent] }));
  },

  deleteEvent: (id) => {
    set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
  },
}));
