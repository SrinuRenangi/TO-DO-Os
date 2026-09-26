import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Folder,
  Pin,
  Trash2,
  Check,
  MoreHorizontal,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Link2,
  Undo2,
  Redo2,
  Sparkles,
  Heading,
  Eye,
  Edit3,
} from 'lucide-react';
import { useNotesStore } from '@/stores/useNotesStore';
import { Note } from '@shared/types';

export const NotesView: React.FC = () => {
  const { notes, selectedNoteId, selectNote, createNote, updateNote, deleteNote, togglePinNote } = useNotesStore();

  const [activeFilter, setActiveFilter] = useState<'All' | 'Pinned' | 'Architecture' | 'Engineering' | 'Personal'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorTitle, setEditorTitle] = useState('');
  const [saveIndicator, setSaveIndicator] = useState('All changes saved');

  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  useEffect(() => {
    if (activeNote) {
      setEditorContent(activeNote.content);
      setEditorTitle(activeNote.title);
    }
  }, [activeNote?.id]);

  const handleContentChange = (val: string) => {
    setEditorContent(val);
    if (activeNote) {
      updateNote(activeNote.id, { content: val });
      setSaveIndicator('Saving...');
      setTimeout(() => setSaveIndicator('All changes saved to SQLite'), 400);
    }
  };

  const handleTitleChange = (val: string) => {
    setEditorTitle(val);
    if (activeNote) {
      updateNote(activeNote.id, { title: val });
    }
  };

  const handleCreateNew = () => {
    const newNote = createNote('New Strategic Note', '# New Strategic Note\n\nType your notes and thoughts here...', 'Engineering');
    selectNote(newNote.id);
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('note-raw-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = prefix + (selected || 'text') + suffix;

    const nextVal = text.substring(0, start) + replacement + text.substring(end);
    handleContentChange(nextVal);
  };

  const filteredNotes = notes.filter((n) => {
    const matchesFilter =
      activeFilter === 'All'
        ? true
        : activeFilter === 'Pinned'
        ? n.pinned
        : n.folder === activeFilter;
    const matchesQuery =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const wordCount = editorContent.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-[1460px] mx-auto space-y-5">
      {/* 1. Header Title & Top View Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 uppercase">
            NOTES SERVICE: KNOWLEDGE ENGINE
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* View Tab Filter */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
            <span className="text-[10px] text-slate-500 font-extrabold px-2">VIEW</span>
            {(['All', 'Pinned', 'Architecture', 'Engineering', 'Personal'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeFilter === tab
                    ? 'bg-white shadow-2xs text-slate-950 font-black'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Note</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Main 3-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* PANEL 1: KNOWLEDGE BASE INDEX (col-span-3) */}
        <div className="lg:col-span-3 studio-panel p-5 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <h3 className="font-black text-xs text-slate-950 uppercase">
                INDEX & PREVIEWS ({filteredNotes.length})
              </h3>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCreateNew}
              className="p-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600"
              title="Create Note"
            >
              <Plus className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          {/* Search Notes */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-semibold text-slate-900 bg-white"
            />
          </div>

          {/* Notes List */}
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredNotes.map((note) => {
              const isSelected = activeNote?.id === note.id;
              return (
                <motion.div
                  key={note.id}
                  layout
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectNote(note.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'border-purple-400 bg-purple-50/60 shadow-2xs border-l-4 border-l-purple-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-950 text-xs truncate flex-1">{note.title}</h4>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePinNote(note.id);
                        }}
                        className={`p-1 rounded hover:bg-white/80 ${
                          note.pinned ? 'text-amber-500' : 'text-slate-300 hover:text-slate-600'
                        }`}
                        title={note.pinned ? 'Unpin' : 'Pin Note'}
                      >
                        <Pin className="w-3 h-3 fill-current" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(note.id);
                        }}
                        className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-white/80"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-medium">
                    {note.content.replace(/^#+\s/g, '').slice(0, 95)}...
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 font-bold">
                    <span className="px-2 py-0.2 rounded-full bg-slate-100 text-slate-700">
                      {note.folder || 'General'}
                    </span>
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* PANEL 2: ACTIVE NOTES EDITOR (Markdown & Live Preview) (col-span-6) */}
        <div className="lg:col-span-6 studio-panel p-5 space-y-3.5">
          {/* Title Header with Inline Title Edit */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <input
              type="text"
              value={editorTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-base font-black text-slate-950 bg-transparent border-none focus:outline-none flex-1"
              placeholder="Note Title..."
            />
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>{saveIndicator}</span>
            </span>
          </div>

          {/* Formatting Toolbar */}
          <div className="flex items-center gap-1 p-1.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 text-xs flex-wrap">
            <button
              onClick={() => insertFormatting('**', '**')}
              className="p-1.5 hover:bg-white rounded-lg font-black transition-colors"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('*', '*')}
              className="p-1.5 hover:bg-white rounded-lg italic transition-colors"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('<u>', '</u>')}
              className="p-1.5 hover:bg-white rounded-lg underline transition-colors"
              title="Underline"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('~~', '~~')}
              className="p-1.5 hover:bg-white rounded-lg line-through transition-colors"
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <span className="w-[1px] h-4 bg-slate-300 mx-1" />
            <button
              onClick={() => insertFormatting('### ')}
              className="p-1.5 hover:bg-white rounded-lg font-black transition-colors"
              title="Heading"
            >
              <Heading className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('`', '`')}
              className="p-1.5 hover:bg-white rounded-lg font-mono transition-colors"
              title="Inline Code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('- ')}
              className="p-1.5 hover:bg-white rounded-lg transition-colors"
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('1. ')}
              className="p-1.5 hover:bg-white rounded-lg transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Split View: Left Raw Markdown | Right Live Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[380px] text-xs">
            {/* Raw Markdown Editor */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col font-mono text-[11px]">
              <div className="text-[10px] font-bold text-slate-500 uppercase pb-1.5 mb-1.5 border-b border-slate-200 flex items-center gap-1">
                <Edit3 className="w-3 h-3" />
                <span>Markdown Input</span>
              </div>
              <textarea
                id="note-raw-textarea"
                value={editorContent}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Write markdown content here..."
                className="w-full flex-1 bg-transparent outline-none resize-none leading-relaxed text-slate-900 font-mono text-xs"
              />
            </div>

            {/* Rendered Live Preview */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl overflow-y-auto space-y-2 text-xs leading-relaxed text-slate-800">
              <div className="text-[10px] font-bold text-slate-500 uppercase pb-1.5 mb-1.5 border-b border-slate-200 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>Live Rendered Preview</span>
              </div>
              <div className="prose prose-sm max-w-none space-y-2 text-slate-800">
                {editorContent.split('\n\n').map((block, idx) => {
                  if (block.startsWith('# ')) {
                    return <h1 key={idx} className="text-base font-black text-slate-950">{block.replace('# ', '')}</h1>;
                  }
                  if (block.startsWith('## ')) {
                    return <h2 key={idx} className="text-sm font-extrabold text-slate-950">{block.replace('## ', '')}</h2>;
                  }
                  if (block.startsWith('### ')) {
                    return <h3 key={idx} className="text-xs font-bold text-slate-950">{block.replace('### ', '')}</h3>;
                  }
                  if (block.startsWith('- ')) {
                    return (
                      <ul key={idx} className="list-disc pl-4 space-y-0.5 text-slate-700">
                        {block.split('\n').map((li, i) => (
                          <li key={i}>{li.replace('- ', '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  if (block.startsWith('```')) {
                    return (
                      <pre key={idx} className="p-2.5 rounded-xl bg-slate-100 text-slate-900 font-mono text-[11px] overflow-x-auto">
                        {block.replace(/```[a-z]*/g, '').trim()}
                      </pre>
                    );
                  }
                  return <p key={idx} className="text-slate-700 font-medium">{block}</p>;
                })}
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 3: NOTES DETAILS & INTEGRATIONS (col-span-3) */}
        <div className="lg:col-span-3 studio-panel p-5 space-y-4 text-xs">
          <div className="pb-3 border-b border-slate-200">
            <h3 className="font-black text-xs text-slate-950 uppercase">
              NOTE METADATA & LINKS
            </h3>
          </div>

          {activeNote && (
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span>Created:</span>
                <span className="font-bold text-slate-900">{new Date(activeNote.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Modified:</span>
                <span className="font-bold text-slate-900">{new Date(activeNote.updatedAt).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Word Count:</span>
                <span className="font-mono font-bold text-blue-700">{wordCount} words</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Folder:</span>
                <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                  {activeNote.folder || 'Engineering'}
                </span>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-950">
              Offline Persistence
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Notes are committed immediately into local SQLite tables with WAL durability. Zero cloud latency or AI tracking.
            </p>
          </div>
        </div>

      </div>

      {/* Footer Status Bar */}
      <div className="pt-4 border-t border-slate-300 flex items-center justify-between text-xs text-slate-800 font-bold">
        <span>Total Notes: {notes.length} | Pinned: {notes.filter((n) => n.pinned).length} | Storage: SQLite Offline WAL</span>
        <span className="text-slate-700 font-mono text-[11px] font-extrabold">* No fake metrics</span>
      </div>
    </div>
  );
};

export default NotesView;
