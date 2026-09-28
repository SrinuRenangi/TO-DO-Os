// ============================================================================
// Personal OS — Notes Service
// Full CRUD, Pinning, Search, Markdown Formatting & Autosave Durability
// ============================================================================

import { databaseService } from '../database/database-service';
import { NoteEntity } from '../database/types';
import { generateId } from '@/lib/utils';

export interface CreateNoteInput {
  title?: string;
  content?: string;
  folder?: string;
  pinned?: boolean;
}

export class NotesService {
  private autosaveTimers: Map<string, NodeJS.Timeout> = new Map();

  public getAllNotes(): NoteEntity[] {
    return databaseService.getNotes().sort((a, b) => {
      // Pinned first, then by updatedAt descending
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  public getNoteById(id: string): NoteEntity | undefined {
    return databaseService.getNotes().find((n) => n.id === id);
  }

  public createNote(input: CreateNoteInput = {}): NoteEntity {
    const now = new Date().toISOString();
    const newNote: NoteEntity = {
      id: generateId('note'),
      title: input.title?.trim() || 'Untitled Note',
      content: input.content || '',
      pinned: input.pinned || false,
      folder: input.folder || 'Personal',
      createdAt: now,
      updatedAt: now,
    };

    databaseService.saveNote(newNote);
    return newNote;
  }

  public updateNote(id: string, updates: Partial<NoteEntity>): NoteEntity | null {
    const existing = this.getNoteById(id);
    if (!existing) return null;

    const updated: NoteEntity = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    databaseService.saveNote(updated);
    return updated;
  }

  /**
   * Autosave helper with debounce to prevent excessive disk/storage writes
   */
  public autosaveNote(id: string, updates: Partial<NoteEntity>, delayMs = 400): Promise<NoteEntity | null> {
    return new Promise((resolve) => {
      if (this.autosaveTimers.has(id)) {
        clearTimeout(this.autosaveTimers.get(id)!);
      }

      const timer = setTimeout(() => {
        this.autosaveTimers.delete(id);
        const result = this.updateNote(id, updates);
        resolve(result);
      }, delayMs);

      this.autosaveTimers.set(id, timer);
    });
  }

  public togglePin(id: string): NoteEntity | null {
    const existing = this.getNoteById(id);
    if (!existing) return null;
    return this.updateNote(id, { pinned: !existing.pinned });
  }

  public toggleShowOnDashboard(id: string): NoteEntity | null {
    const existing = this.getNoteById(id);
    if (!existing) return null;
    const current = existing.showOnDashboard !== undefined ? existing.showOnDashboard : existing.pinned;
    return this.updateNote(id, { showOnDashboard: !current });
  }

  public deleteNote(id: string): boolean {
    if (this.autosaveTimers.has(id)) {
      clearTimeout(this.autosaveTimers.get(id)!);
      this.autosaveTimers.delete(id);
    }
    return databaseService.deleteNote(id);
  }

  public searchNotes(query: string): NoteEntity[] {
    if (!query.trim()) return this.getAllNotes();
    const q = query.toLowerCase();
    return this.getAllNotes().filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.folder.toLowerCase().includes(q)
    );
  }
}

export const notesService = new NotesService();
