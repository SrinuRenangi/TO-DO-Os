// ============================================================================
// Personal OS — Events Service
// Dedicated Management of Calendar Events, Appointments, Meetings, Special Occasions
// Strictly decoupled from Tasks table to ensure complete data integrity.
// ============================================================================

import { databaseService } from '../database/database-service';
import { EventEntity, EventCategory } from '../database/types';
import { generateId } from '@/lib/utils';

export interface CreateEventInput {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  date: string; // YYYY-MM-DD
  isAllDay?: boolean;
  category?: EventCategory;
  color?: string;
}

export class EventsService {
  public getAllEvents(): EventEntity[] {
    return databaseService.getEvents().sort((a, b) => {
      // Sort by date then startTime
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.startTime.localeCompare(b.startTime);
    });
  }

  public getEventsForDate(dateStr: string): EventEntity[] {
    return this.getAllEvents().filter((e) => e.date === dateStr);
  }

  public getEventById(id: string): EventEntity | undefined {
    return databaseService.getEvents().find((e) => e.id === id);
  }

  public createEvent(input: CreateEventInput): EventEntity {
    const now = new Date().toISOString();
    const newEvent: EventEntity = {
      id: generateId('evt'),
      title: input.title.trim() || 'Untitled Event',
      description: input.description || '',
      startTime: input.startTime || '09:00',
      endTime: input.endTime || '10:00',
      date: input.date,
      isAllDay: Boolean(input.isAllDay),
      category: input.category || 'meeting',
      color: input.color || '#6366F1',
      createdAt: now,
    };

    databaseService.saveEvent(newEvent);
    return newEvent;
  }

  public updateEvent(id: string, updates: Partial<EventEntity>): EventEntity | null {
    const existing = this.getEventById(id);
    if (!existing) return null;

    const updated: EventEntity = {
      ...existing,
      ...updates,
    };

    databaseService.saveEvent(updated);
    return updated;
  }

  public deleteEvent(id: string): boolean {
    return databaseService.deleteEvent(id);
  }
}

export const eventsService = new EventsService();
