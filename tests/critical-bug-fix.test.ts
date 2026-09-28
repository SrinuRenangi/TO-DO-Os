import { describe, it, expect } from 'vitest';
import { databaseService } from '../src/services/database/database-service';
import { taskService } from '../src/services/tasks/task-service';
import { eventsService } from '../src/services/events/events-service';
import { notesService } from '../src/services/notes/notes-service';
import { calendarService } from '../src/services/calendar/calendar-service';
import { useNotesStore } from '../src/renderer/stores/useNotesStore';
import { useCalendarStore } from '../src/renderer/stores/useCalendarStore';
import { useTaskStore } from '../src/renderer/stores/useTaskStore';

describe('Critical Bug Fix Suite — Navigation & Data Separation', () => {
  // --------------------------------------------------------------------------
  // ISSUE 1 & PHASE 9.2: PINNED NOTES NAVIGATION & HYDRATION
  // --------------------------------------------------------------------------
  describe('Issue 1: Notes Navigation Chain & Null Safety', () => {
    it('verifies complete navigation chain: selectNote -> store state -> active note resolution', () => {
      const notesStore = useNotesStore.getState();
      const allNotes = notesStore.notes;
      expect(allNotes.length).toBeGreaterThan(0);

      const targetNote = allNotes[0];
      notesStore.selectNote(targetNote.id);

      const updatedState = useNotesStore.getState();
      expect(updatedState.selectedNoteId).toBe(targetNote.id);

      // Verify active note resolution never yields null when notes exist
      const active = updatedState.notes.find((n) => n.id === updatedState.selectedNoteId) || updatedState.notes[0];
      expect(active).toBeDefined();
      expect(active.id).toBe(targetNote.id);
      expect(typeof active.title).toBe('string');
      expect(typeof active.content).toBe('string');
    });

    it('verifies safe handling of notes with empty or undefined content', () => {
      const note = notesService.createNote({
        title: 'Empty Content Note',
        content: '',
      });

      expect(note).toBeDefined();
      expect(note.content).toBe('');

      // Test safe formatting without throwing
      const formatted = (note.content || '').replace(/^#+\s/g, '').slice(0, 70);
      expect(formatted).toBe('');

      const splitBlocks = (note.content || '').split('\n\n');
      expect(Array.isArray(splitBlocks)).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // ISSUE 2: TASKS AND CALENDAR EVENTS STRICT SEPARATION
  // --------------------------------------------------------------------------
  describe('Issue 2: Tasks Table vs Events Table Separation', () => {
    it('ensures Calendar Events and Tasks are decoupled in distinct services and tables', () => {
      const initialTaskCount = taskService.getAllTasks().length;
      const initialEventCount = eventsService.getAllEvents().length;

      // 1. Create a Calendar Event (e.g. Doctor Appointment)
      const createdEvent = eventsService.createEvent({
        title: 'Doctor Appointment',
        description: 'Annual health checkup',
        date: '2026-10-05',
        startTime: '14:00',
        endTime: '15:00',
        category: 'appointment',
      });

      expect(createdEvent.id).toMatch(/^evt_/);
      expect(createdEvent.category).toBe('appointment');

      // Verify Events table grew, but Tasks table DID NOT grow
      const afterEventTaskCount = taskService.getAllTasks().length;
      const afterEventCount = eventsService.getAllEvents().length;

      expect(afterEventCount).toBe(initialEventCount + 1);
      expect(afterEventTaskCount).toBe(initialTaskCount); // Tasks table remains completely untouched!

      // 2. Create a Task (e.g. Learn Java)
      const createdTask = taskService.createTask({
        title: 'Learn Java',
        dueDate: '2026-10-05',
        priority: 'P1',
        recurring: 'daily',
      });

      expect(createdTask.id).toMatch(/^task_/);

      // Verify Tasks table grew, but Events table DID NOT grow
      const finalTaskCount = taskService.getAllTasks().length;
      const finalEventCount = eventsService.getAllEvents().length;

      expect(finalTaskCount).toBe(afterEventTaskCount + 1);
      expect(finalEventCount).toBe(afterEventCount); // Events table remains untouched!

      // 3. Verify calendarService.getUnifiedItems() accurately tags their distinct sourceTypes
      const unified = calendarService.getUnifiedItems();
      const mappedEvent = unified.find((i) => i.sourceId === createdEvent.id);
      const mappedTask = unified.find((i) => i.sourceId === createdTask.id);

      expect(mappedEvent).toBeDefined();
      expect(mappedEvent?.sourceType).toBe('event');
      expect(mappedEvent?.category).toBe('appointment');

      expect(mappedTask).toBeDefined();
      expect(mappedTask?.sourceType).toBe('task');
      expect(mappedTask?.priority).toBe('P1');
    });

    it('ensures useCalendarStore.addEvent creates an Event in eventsService, not a Task', () => {
      const initialTaskCount = taskService.getAllTasks().length;
      const initialEventCount = eventsService.getAllEvents().length;

      useCalendarStore.getState().addEvent(
        'Strategic Architecture Conference',
        '2026-10-10',
        '09:00',
        '17:00',
        'conference'
      );

      const afterTaskCount = taskService.getAllTasks().length;
      const afterEventCount = eventsService.getAllEvents().length;

      expect(afterEventCount).toBe(initialEventCount + 1);
      expect(afterTaskCount).toBe(initialTaskCount); // Zero tasks created!
    });
  });

  // --------------------------------------------------------------------------
  // ISSUE 3 & ISSUE 6: SNAPSHOT FILTERS & PERSISTENT DAILY TASKS
  // --------------------------------------------------------------------------
  describe('Issue 3 & 6: Calendar Snapshot Filter and Daily Recurring Tasks', () => {
    it('verifies persistent daily tasks exist and are displayed only for their relevant date', () => {
      const allTasks = taskService.getAllTasks();
      const javaTask = allTasks.find((t) => t.title.toLowerCase().includes('learn java'));
      const fineTuningTask = allTasks.find((t) => t.title.toLowerCase().includes('fine tuning'));

      expect(javaTask).toBeDefined();
      expect(javaTask?.recurring).toBe('daily');
      expect(fineTuningTask).toBeDefined();
      expect(fineTuningTask?.recurring).toBe('daily');

      // Test snapshot filtering for Today vs Tomorrow
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const todayTasks = allTasks.filter((t) => {
        if (t.dueDate === today) return true;
        if (t.recurring === 'daily' && t.dueDate && t.dueDate <= today) return true;
        return false;
      });

      const tomorrowTasks = allTasks.filter((t) => {
        if (t.dueDate === tomorrow) return true;
        if (t.recurring === 'daily' && t.dueDate && t.dueDate <= tomorrow) return true;
        return false;
      });

      expect(todayTasks.some((t) => t.title.toLowerCase().includes('learn java'))).toBe(true);
      expect(tomorrowTasks.some((t) => t.title.toLowerCase().includes('learn java'))).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // ISSUE 5: NOTES DASHBOARD CONTROL
  // --------------------------------------------------------------------------
  describe('Issue 5: Show On Dashboard Note Toggle Control', () => {
    it('toggles showOnDashboard property and filters dashboard notes strictly', () => {
      const notesStore = useNotesStore.getState();
      const testNote = notesStore.createNote('Dashboard Test Note', 'Content for dashboard test');

      // Initially showOnDashboard is false or matches pinned
      expect(testNote.showOnDashboard === true).toBe(false);

      // Toggle showOnDashboard ON
      notesStore.toggleShowOnDashboard(testNote.id);
      let refreshed = useNotesStore.getState().notes.find((n) => n.id === testNote.id);
      expect(refreshed?.showOnDashboard).toBe(true);

      // Verify dashboard filter only includes notes with showOnDashboard === true
      const allNotes = useNotesStore.getState().notes;
      const dashboardNotes = allNotes.filter((n) =>
        n.showOnDashboard !== undefined ? n.showOnDashboard : n.pinned
      );
      expect(dashboardNotes.some((n) => n.id === testNote.id)).toBe(true);

      // Toggle showOnDashboard OFF
      notesStore.toggleShowOnDashboard(testNote.id);
      refreshed = useNotesStore.getState().notes.find((n) => n.id === testNote.id);
      expect(refreshed?.showOnDashboard).toBe(false);

      const dashboardNotesAfter = useNotesStore.getState().notes.filter((n) =>
        n.showOnDashboard !== undefined ? n.showOnDashboard : n.pinned
      );
      expect(dashboardNotesAfter.some((n) => n.id === testNote.id)).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // DATABASE DURABILITY & SNAPSHOT RESTORE
  // --------------------------------------------------------------------------
  describe('Snapshot Export & Restore with Events', () => {
    it('exports and restores database snapshot including events and dashboard notes', () => {
      const snapshot = databaseService.exportSnapshot();
      expect(snapshot.tasks).toBeDefined();
      expect(snapshot.events).toBeDefined();
      expect(snapshot.notes).toBeDefined();
      expect(Array.isArray(snapshot.events)).toBe(true);

      const success = databaseService.restoreSnapshot(snapshot);
      expect(success).toBe(true);
      expect(databaseService.getEvents().length).toBe(snapshot.events.length);
    });
  });
});
