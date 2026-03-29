import { useState, useEffect, useRef } from 'react'
import { Plus, Pin, Trash2, Search } from 'lucide-react'
import NoteEditor from './NoteEditor'
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
  const textMuted = 'text-neutral-500 dark:text-neutral-400'

  useEffect(() => {
    const loadNotes = () => {
      window.api.notes.getAll().then(ns => {
        setNotes(ns)
        // Only set selected if we don't already have one, or if ours was deleted
        setSelected(prev => {
           if (!prev && ns.length > 0) return ns[0]
           const stillExists = ns.find(n => n.id === prev?.id)
           if (prev && !stillExists) return null
           return prev
        })
      })
    }
    loadNotes()
    
    // Auto-refresh when clicking back to the main window
    window.addEventListener('focus', loadNotes)
    return () => window.removeEventListener('focus', loadNotes)
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
                {note.content ? note.content.replace(/<[^>]+>/g, '') : 'Empty note'}
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
        <NoteEditor 
          note={selected} 
          onChange={(changes) => autoSave(selected, changes)}
          onClose={() => setSelected(null)} 
        />
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
