import { create } from 'zustand';
import { Note, NoteTemplate } from '@shared/types';
import { notesService } from '@/services/notes/notes-service';
import { NoteEntity } from '@/services/database/types';
import { useTaskStore } from './useTaskStore';

interface NotesState {
  notes: Note[];
  selectedNoteId: string | null;
  scratchpad: string;
  searchQuery: string;
  selectedFolder: string;
  folders: string[];
  templates: NoteTemplate[];

  // Actions
  refreshNotes: () => void;
  selectNote: (id: string | null) => void;
  createNote: (title?: string, content?: string, folder?: string, tags?: string[]) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  applyTemplate: (noteId: string, templateId: string) => void;
  setScratchpad: (content: string) => void;
  convertScratchpadToTask: () => void;
  saveScratchpadAsNote: () => void;
  clearScratchpad: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedFolder: (folder: string) => void;
  addFolder: (folder: string) => void;
}

const TEMPLATES: NoteTemplate[] = [
  {
    id: 'tpl-standup',
    name: 'Daily Standup',
    description: 'Yesterday, Today, Blockers format',
    content: `# Daily Standup • ${new Date().toISOString().split('T')[0]}

### 1. What was completed yesterday?
- Finalized Linux desktop architecture and event-driven scheduler.

### 2. What will be accomplished today?
- Review system telemetry and test 24/7 background runtime.

### 3. Any blockers?
- None. System running offline and fully deterministic.`,
  },
  {
    id: 'tpl-rfc',
    name: 'Architecture RFC',
    description: 'System design request for comments',
    content: `# RFC: [Title of Component]

## Context & Motivation
Describe why this architecture is needed.

## Proposed Design
Detailed technical breakdown.

## Verification & Benchmarks
Target latency, memory footprint, and test plan.`,
  },
  {
    id: 'tpl-retro',
    name: 'Sprint Retrospective',
    description: 'Start, Stop, Continue format',
    content: `# Sprint Retrospective

### What went exceptionally well?
- Fast delivery of 24/7 desktop daemon with zero memory leaks.

### What could be improved?
- Expand customizable widget presets.

### Action Items
- [ ] Monitor background CPU below 0.1%.`,
  },
];

function entityToNote(entity: NoteEntity): Note {
  return {
    id: entity.id,
    title: entity.title,
    content: entity.content,
    pinned: entity.pinned,
    folder: entity.folder,
    tags: ['#note'],
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

function loadNotes(): Note[] {
  return notesService.getAllNotes().map(entityToNote);
}

const initialNotes = loadNotes();

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: initialNotes,
  selectedNoteId: initialNotes[0]?.id || null,
  scratchpad: `# Fleeting Thoughts & Ideas
- Personal OS: Review today's schedule and tasks
- Test SQLite backup snapshot export/restore`,
  searchQuery: '',
  selectedFolder: 'All',
  folders: ['All', 'Architecture', 'Engineering', 'Productivity', 'Personal'],
  templates: TEMPLATES,

  refreshNotes: () => {
    const notes = loadNotes();
    set({ notes });
  },

  selectNote: (id) => set({ selectedNoteId: id }),

  createNote: (title = 'Untitled Note', content = '', folder = 'Personal') => {
    const created = notesService.createNote({
      title,
      content,
      folder,
    });
    const notes = loadNotes();
    const newNote = entityToNote(created);
    set({
      notes,
      selectedNoteId: newNote.id,
    });
    return newNote;
  },

  updateNote: (id, updates) => {
    notesService.autosaveNote(id, {
      title: updates.title,
      content: updates.content,
      folder: updates.folder,
      pinned: updates.pinned,
    });
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
      ),
    }));
  },

  deleteNote: (id) => {
    notesService.deleteNote(id);
    const remaining = loadNotes();
    set((state) => ({
      notes: remaining,
      selectedNoteId: state.selectedNoteId === id ? remaining[0]?.id || null : state.selectedNoteId,
    }));
  },

  togglePinNote: (id) => {
    notesService.togglePin(id);
    set({ notes: loadNotes() });
  },

  applyTemplate: (noteId, templateId) => {
    const template = get().templates.find((t) => t.id === templateId);
    if (!template) return;
    get().updateNote(noteId, {
      title: template.name,
      content: template.content,
    });
  },

  setScratchpad: (content) => set({ scratchpad: content }),

  convertScratchpadToTask: () => {
    const { scratchpad } = get();
    if (!scratchpad.trim()) return;

    const firstLine = scratchpad.trim().split('\n')[0].replace(/^[#\-* ]+/, '');
    if (firstLine) {
      useTaskStore.getState().addTask(firstLine, 'P1', 'Engineering', undefined, undefined, 'none', ['#capture']);
    }
  },

  saveScratchpadAsNote: () => {
    const { scratchpad } = get();
    if (!scratchpad.trim()) return;

    const lines = scratchpad.trim().split('\n');
    const title = lines[0].replace(/^[#\-* ]+/, '') || 'Untitled Note';
    get().createNote(title, scratchpad, 'Personal');
  },

  clearScratchpad: () => set({ scratchpad: '' }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedFolder: (folder) => set({ selectedFolder: folder }),
  addFolder: (folder) => set((state) => ({ folders: [...state.folders, folder] })),
}));
