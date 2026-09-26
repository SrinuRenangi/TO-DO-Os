import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Pin,
  Folder,
  Tag,
  Search,
  Trash2,
  BookOpen,
  Eye,
  Edit3,
  Check,
} from 'lucide-react';
import { useNotesStore } from '@/stores/useNotesStore';

export const NotesView: React.FC = () => {
  const {
    notes,
    selectedNoteId,
    selectNote,
    createNote,
    updateNote,
    deleteNote,
    togglePinNote,
    applyTemplate,
    templates,
    folders,
    selectedFolder,
    setSelectedFolder,
    searchQuery,
    setSearchQuery,
  } = useNotesStore();

  const [previewMode, setPreviewMode] = useState(false);
  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const filteredNotes = notes.filter((n) => {
    const matchesFolder = selectedFolder === 'All' || n.folder === selectedFolder;
    const matchesQuery =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesQuery;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.pinned);
  const regularNotes = filteredNotes.filter((n) => !n.pinned);

  return (
    <div className="h-[calc(100vh-2.5rem)] flex flex-col md:flex-row overflow-hidden bg-[#0B1220]">
      {/* 1. Folders & Note Tree (Left Pane) */}
      <div className="w-full md:w-64 border-r border-[rgba(255,255,255,0.06)] bg-[#111827] flex flex-col p-4 select-none">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#4F8CFF]/15 text-[#4F8CFF]">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">Notes & Docs</h2>
          </div>
          <button
            onClick={() => createNote('New Note', '', selectedFolder === 'All' ? 'Personal' : selectedFolder)}
            className="p-1.5 rounded-xl bg-[#4F8CFF] text-white hover:bg-[#3b82f6] shadow-sm transition-all"
            title="Create note"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1A2333] mb-4">
          <Search className="w-3.5 h-3.5 text-[#64748B]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full bg-transparent text-xs text-[#F8FAFC] placeholder-[#64748B] outline-none"
          />
        </div>

        {/* Folders List */}
        <div className="mb-4">
          <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider mb-2 block">
            Folders
          </span>
          <div className="space-y-1">
            {folders.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFolder(f)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedFolder === f
                    ? 'bg-[#4F8CFF]/15 text-[#4F8CFF] border border-[#4F8CFF]/30'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A2333]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Folder className="w-3.5 h-3.5" />
                  <span>{f}</span>
                </div>
                <span className="text-[10px] text-[#64748B]">
                  {f === 'All' ? notes.length : notes.filter((n) => n.folder === f).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Templates Picker */}
        <div className="mt-auto pt-3 border-t border-[rgba(255,255,255,0.06)]">
          <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider mb-2 block">
            Insert Template
          </span>
          <div className="space-y-1">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => activeNote && applyTemplate(activeNote.id, tpl.id)}
                className="w-full text-left px-2.5 py-1 rounded-lg text-[11px] text-[#94A3B8] hover:text-[#4F8CFF] hover:bg-[#1A2333] truncate block"
              >
                + {tpl.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Note Cards List (Middle Pane) */}
      <div className="w-full md:w-80 border-r border-[rgba(255,255,255,0.06)] bg-[#0B1220] flex flex-col p-4 overflow-y-auto">
        {pinnedNotes.length > 0 && (
          <div className="mb-4">
            <span className="text-[10px] uppercase font-bold text-[#F59E0B] tracking-wider mb-2 flex items-center gap-1">
              <Pin className="w-3 h-3" /> Pinned Notes
            </span>
            <div className="space-y-2">
              {pinnedNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => selectNote(note.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedNoteId === note.id
                      ? 'border-[#4F8CFF] bg-[#1A2333] shadow-lg shadow-[#4F8CFF]/15'
                      : 'border-[rgba(255,255,255,0.06)] bg-[#111827] hover:bg-[#1A2333]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#F8FAFC] truncate">{note.title}</h4>
                    <Pin className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1 line-clamp-2">
                    {note.content.replace(/^[#\s]+/, '') || 'Empty note...'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider mb-2 block">
            All Notes ({regularNotes.length})
          </span>
          <div className="space-y-2">
            {regularNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => selectNote(note.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  selectedNoteId === note.id
                    ? 'border-[#4F8CFF] bg-[#1A2333] shadow-lg shadow-[#4F8CFF]/15'
                    : 'border-[rgba(255,255,255,0.06)] bg-[#111827] hover:bg-[#1A2333]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-[#F8FAFC] truncate">{note.title}</h4>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1A2333] text-[#4F8CFF]">
                    {note.folder}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] mt-1 line-clamp-2">
                  {note.content.replace(/^[#\s]+/, '') || 'Empty note...'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Note Editor & Markdown Live Canvas (Right Pane) */}
      <div className="flex-1 flex flex-col bg-[#111827] overflow-hidden">
        {activeNote ? (
          <>
            {/* Editor Toolbar */}
            <div className="p-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
              <input
                value={activeNote.title}
                onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                placeholder="Note title..."
                className="text-lg font-bold text-[#F8FAFC] bg-transparent outline-none flex-1"
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePinNote(activeNote.id)}
                  className={`p-2 rounded-xl border transition-all ${
                    activeNote.pinned
                      ? 'border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B]/10'
                      : 'border-[rgba(255,255,255,0.08)] text-[#64748B] hover:text-[#F8FAFC]'
                  }`}
                  title={activeNote.pinned ? 'Unpin Note' : 'Pin Note'}
                >
                  <Pin className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    previewMode
                      ? 'border-[#4F8CFF] text-[#4F8CFF] bg-[#4F8CFF]/15'
                      : 'border-[rgba(255,255,255,0.08)] text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {previewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{previewMode ? 'Edit' : 'Preview'}</span>
                </button>

                <button
                  onClick={() => deleteNote(activeNote.id)}
                  className="p-2 rounded-xl text-[#64748B] hover:text-[#EF4444] hover:bg-[#1A2333] transition-all"
                  title="Delete Note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Note Body */}
            <div className="flex-1 p-6 overflow-y-auto">
              {previewMode ? (
                <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-3 font-sans">
                  {activeNote.content.split('\n').map((line, idx) => {
                    if (line.startsWith('# ')) return <h1 key={idx} className="text-xl font-bold text-[#4F8CFF]">{line.slice(2)}</h1>;
                    if (line.startsWith('## ')) return <h2 key={idx} className="text-base font-bold text-[#F8FAFC]">{line.slice(3)}</h2>;
                    if (line.startsWith('### ')) return <h3 key={idx} className="text-sm font-semibold text-[#94A3B8]">{line.slice(4)}</h3>;
                    if (line.startsWith('- ')) return <li key={idx} className="text-[#94A3B8] ml-4">{line.slice(2)}</li>;
                    if (line.trim() === '') return <div key={idx} className="h-2" />;
                    return <p key={idx} className="text-[#F8FAFC]">{line}</p>;
                  })}
                </div>
              ) : (
                <textarea
                  value={activeNote.content}
                  onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                  placeholder="Type markdown content..."
                  className="w-full h-full bg-transparent text-xs text-[#F8FAFC] placeholder-[#64748B] outline-none resize-none font-mono leading-relaxed"
                />
              )}
            </div>

            {/* Footer Status */}
            <div className="p-3 border-t border-[rgba(255,255,255,0.06)] bg-[#0B1220] flex items-center justify-between text-[11px] text-[#64748B]">
              <span>Folder: <span className="text-[#4F8CFF] font-semibold">{activeNote.folder}</span></span>
              <span>{activeNote.content.split(/\s+/).filter(Boolean).length} words • Autosaved to SQLite</span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-xs text-[#64748B]">
            <BookOpen className="w-8 h-8 mb-2 opacity-40" />
            <span>Select or create a note to begin editing</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesView;
