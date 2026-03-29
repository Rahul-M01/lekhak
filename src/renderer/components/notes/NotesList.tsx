import { useState, useEffect, useRef } from 'react'
import { Plus, Pin, Trash2, Search, X } from 'lucide-react'
import type { Note, Theme } from '../../types'

interface Props { theme: Theme }

// Minimalist pastel/monochrome tones for notes
const NOTE_COLORS_DARK = ['#151515', '#1a1a1a', '#222222', '#1c1c1c']
const NOTE_COLORS_LIGHT = ['#fdfdfd', '#f5f5f5', '#fafafa', '#fdfdfd']

export default function NotesList({ theme }: Props) {
  const [notes, setNotes] = useState<Note[]>([])
  const [selected, setSelected] = useState<Note | null>(null)
  const [search, setSearch] = useState('')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDark = theme === 'dark'

  const sidebar = 'bg-neutral-50 dark:bg-[#0a0a0a] subtle-border border-r'
  const inputStyling = 'bg-white dark:bg-[#121212] text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 subtle-border'
  const editor = 'bg-white dark:bg-[#121212]'
  const textMuted = 'text-neutral-500 dark:text-neutral-400'

  useEffect(() => {
    window.api.notes.getAll().then(ns => {
      setNotes(ns)
      if (ns.length > 0 && !selected) setSelected(ns[0])
    })
  }, [])

  const createNote = async () => {
    const colors = isDark ? NOTE_COLORS_DARK : NOTE_COLORS_LIGHT
    const color = colors[Math.floor(Math.random() * colors.length)]
    const note = await window.api.notes.create({ title: '', content: '', color })
    setNotes(prev => [note, ...prev])
    setSelected(note)
  }

  const deleteNote = async (id: number) => {
    await window.api.notes.delete(id)
    setNotes(prev => {
      const next = prev.filter(n => n.id !== id)
      if (selected?.id === id) setSelected(next[0] || null)
      return next
    })
  }

  const pinNote = async (id: number) => {
    const updated = await window.api.notes.togglePin(id)
    setNotes(prev => {
      const next = prev.map(n => n.id === id ? updated : n)
      next.sort((a, b) => b.pinned - a.pinned || new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      return next
    })
  }

  const autoSave = (note: Note, changes: Partial<Note>) => {
    const updated = { ...note, ...changes }
    setSelected(updated)
    setNotes(prev => prev.map(n => n.id === note.id ? updated : n))
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      await window.api.notes.update(note.id, changes)
    }, 600)
  }

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex-1 overflow-hidden flex pt-8 rounded-xl h-full">
      {/* Notes sidebar */}
      <div className={`w-[280px] flex flex-col ${sidebar}`}>
        <div className="p-4 flex gap-2">
          <div className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-shadow focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white ${inputStyling}`}>
            <Search size={14} className="text-neutral-400" />
            <input
              className="flex-1 bg-transparent outline-none allow-select"
              placeholder="Search notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={createNote}
            className="px-3.5 py-2.5 rounded-lg transition-all focus-ring bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1.5 pb-4">
          {filtered.map(note => (
            <div
              key={note.id}
              onClick={() => setSelected(note)}
              className={`p-3.5 rounded-xl cursor-pointer group relative transition-all border ${
                selected?.id === note.id
                  ? 'bg-white dark:bg-[#1a1a1a] border-neutral-300 dark:border-neutral-600 shadow-sm'
                  : 'bg-transparent border-transparent hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <p className="text-[14px] font-semibold tracking-tight truncate flex-1 text-black dark:text-white">{note.title || 'Untitled'}</p>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity">
                  <button onClick={e => { e.stopPropagation(); pinNote(note.id) }}
                    className={`p-1 rounded-md text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${note.pinned ? 'text-black dark:text-white' : ''}`}>
                    <Pin size={12} className={note.pinned ? "fill-current" : ""} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); deleteNote(note.id) }}
                    className="p-1 rounded-md text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <p className={`text-[13px] leading-snug truncate ${textMuted}`}>
                {note.content || 'Empty note'}
              </p>
              <p className={`text-[11px] font-medium mt-2 ${selected?.id === note.id ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-400 dark:text-neutral-500'}`}>
                {new Date(note.updated_at).toLocaleDateString('en-GB')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      {selected ? (
        <div className={`flex-1 flex flex-col ${editor}`}>
          <div className="px-10 py-6 subtle-border border-b flex items-start gap-4">
            <div className="flex-1">
              <input
                className="w-full text-2xl font-bold bg-transparent outline-none allow-select text-black dark:text-white placeholder-neutral-300 dark:placeholder-neutral-700 tracking-tight"
                value={selected.title}
                onChange={e => autoSave(selected, { title: e.target.value })}
                placeholder="Note title..."
              />
              <p className={`text-xs font-medium mt-1.5 ${textMuted}`}>
                Last edited {new Date(selected.updated_at).toLocaleString('en-GB')}
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="p-2 rounded-lg transition-colors text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white focus-ring"
            >
              <X size={18} />
            </button>
          </div>
          <textarea
            className={`flex-1 w-full px-10 py-8 bg-transparent outline-none resize-none text-[15px] leading-relaxed allow-select text-black dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600`}
            value={selected.content}
            onChange={e => autoSave(selected, { content: e.target.value })}
            placeholder="Start writing..."
            spellCheck="false"
          />
        </div>
      ) : (
        <div className={`flex-1 flex items-center justify-center bg-white dark:bg-[#121212] text-neutral-400 dark:text-neutral-500`}>
          <div className="text-center">
            <p className="text-lg font-medium mb-4 text-black dark:text-white">No note selected</p>
            <button onClick={createNote} className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all focus-ring bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200">
              Create a note
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
