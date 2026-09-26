import { create } from 'zustand';
import { Note } from '@shared/types';
import { generateId } from '@/lib/utils';
import { useTaskStore } from './useTaskStore';

interface NotesState {
  scratchpad: string;
  notes: Note[];
  setScratchpad: (content: string) => void;
  convertScratchpadToTask: () => void;
  saveScratchpadAsNote: () => void;
  clearScratchpad: () => void;
}

const INITIAL_SCRATCHPAD = `# Fleeting Thoughts & Ideas
- Research Raycast extensions for local Ollama invocation
- Personal OS: Consider adding ultradian 90m rhythm bell
- Verify SQLite WAL checkpointing frequency on shutdown`;

export const useNotesStore = create<NotesState>((set, get) => ({
  scratchpad: INITIAL_SCRATCHPAD,
  notes: [],

  setScratchpad: (content) => set({ scratchpad: content }),

  convertScratchpadToTask: () => {
    const { scratchpad } = get();
    if (!scratchpad.trim()) return;

    const firstLine = scratchpad.trim().split('\n')[0].replace(/^[#\-* ]+/, '');
    if (firstLine) {
      useTaskStore.getState().addTask(firstLine, 'P1', ['#capture']);
    }
  },

  saveScratchpadAsNote: () => {
    const { scratchpad, notes } = get();
    if (!scratchpad.trim()) return;

    const lines = scratchpad.trim().split('\n');
    const title = lines[0].replace(/^[#\-* ]+/, '') || 'Untitled Scratchpad Note';

    const newNote: Note = {
      id: generateId('note'),
      title,
      content: scratchpad,
      pinned: false,
      tags: ['#scratchpad'],
      folder: 'Quick Notes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set({ notes: [newNote, ...notes] });
  },

  clearScratchpad: () => set({ scratchpad: '' }),
}));
