import { useState, useEffect, useRef } from 'react'
import { Plus, Pin, Trash2, Search } from 'lucide-react'
import type { Note, Theme } from '../../types'

interface Props { theme: Theme }

const NOTE_COLORS_DARK = ['#1e1e2e', '#2d1f3e', '#1f2d2e', '#2d2b1f', '#2d1f1f']
const NOTE_COLORS_LIGHT = ['#eff1f5', '#f0e8ff', '#e8f0ff', '#e8ffe8', '#fff0e8']

export default function NotesList({ theme }: Props) {
  const [notes, setNotes] = useState<Note[]>([])
  const [selected, setSelected] = useState<Note | null>(null)
  const [search, setSearch] = useState('')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDark = theme === 'dark'

  const sidebar = isDark ? 'bg-[#181825] border-[#313244]' : 'bg-[#e6e9ef] border-[#bcc0cc]'
  const input = isDark ? 'bg-[#313244] text-[#cdd6f4] placeholder-[#6c7086] border-[#45475a]' : 'bg-white text-[#4c4f69] placeholder-[#9ca0b0] border-[#bcc0cc]'
  const editor = isDark ? 'bg-[#1e1e2e] text-[#cdd6f4]' : 'bg-white text-[#4c4f69]'

  useEffect(() => {
    window.api.notes.getAll().then(ns => {
      setNotes(ns)
      if (ns.length > 0 && !selected) setSelected(ns[0])
    })
  }, [])

  const createNote = async () => {
    const colors = isDark ? NOTE_COLORS_DARK : NOTE_COLORS_LIGHT
    const color = colors[Math.floor(Math.random() * colors.length)]
    const note = await window.api.notes.create({ title: 'Untitled', content: '', color })
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
    <div className="flex-1 overflow-hidden flex pt-8">
      {/* Notes sidebar */}
      <div className={`w-64 flex flex-col border-r ${sidebar}`}>
        <div className="p-3 flex gap-2">
          <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${input}`}>
            <Search size={13} />
            <input
              className="flex-1 bg-transparent outline-none allow-select"
              placeholder="Search notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={createNote}
            className={`px-3 py-2 rounded-lg transition-colors ${isDark ? 'bg-[#cba6f7] text-[#1e1e2e] hover:bg-[#b89af4]' : 'bg-[#8839ef] text-white hover:bg-[#7425d6]'}`}
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {filtered.map(note => (
            <div
              key={note.id}
              onClick={() => setSelected(note)}
              className={`p-3 rounded-lg cursor-pointer group relative transition-colors ${
                selected?.id === note.id
                  ? isDark ? 'bg-[#313244]' : 'bg-[#c6cad8]'
                  : isDark ? 'hover:bg-[#313244]/60' : 'hover:bg-[#c6cad8]/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium truncate flex-1">{note.title || 'Untitled'}</p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0">
                  <button onClick={e => { e.stopPropagation(); pinNote(note.id) }}
                    className={`p-1 rounded ${note.pinned ? (isDark ? 'text-[#cba6f7]' : 'text-[#8839ef]') : ''}`}>
                    <Pin size={11} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); deleteNote(note.id) }}
                    className="p-1 rounded hover:text-red-400">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
              <p className={`text-xs mt-1 truncate ${isDark ? 'text-[#6c7086]' : 'text-[#9ca0b0]'}`}>
                {note.content || 'Empty note'}
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-[#585b70]' : 'text-[#bcc0cc]'}`}>
                {new Date(note.updated_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      {selected ? (
        <div className={`flex-1 flex flex-col ${editor}`}>
          <div className={`px-8 py-4 border-b ${isDark ? 'border-[#313244]' : 'border-[#bcc0cc]'}`}>
            <input
              className={`w-full text-xl font-bold bg-transparent outline-none allow-select ${isDark ? 'text-[#cdd6f4]' : 'text-[#4c4f69]'}`}
              value={selected.title}
              onChange={e => autoSave(selected, { title: e.target.value })}
              placeholder="Note title..."
            />
            <p className={`text-xs mt-1 ${isDark ? 'text-[#6c7086]' : 'text-[#9ca0b0]'}`}>
              Last edited {new Date(selected.updated_at).toLocaleString()}
            </p>
          </div>
          <textarea
            className={`flex-1 p-8 pt-6 bg-transparent outline-none resize-none text-sm leading-relaxed allow-select ${isDark ? 'text-[#cdd6f4] placeholder-[#585b70]' : 'text-[#4c4f69] placeholder-[#9ca0b0]'}`}
            value={selected.content}
            onChange={e => autoSave(selected, { content: e.target.value })}
            placeholder="Start writing..."
          />
        </div>
      ) : (
        <div className={`flex-1 flex items-center justify-center ${isDark ? 'text-[#6c7086]' : 'text-[#9ca0b0]'}`}>
          <div className="text-center">
            <p className="text-lg mb-2">No note selected</p>
            <button onClick={createNote} className={`text-sm px-4 py-2 rounded-lg ${isDark ? 'bg-[#313244] hover:bg-[#45475a]' : 'bg-[#c6cad8] hover:bg-[#bcc0cc]'}`}>
              Create a note
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
