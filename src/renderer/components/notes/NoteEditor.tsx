import type { Note, Theme } from '../../types'

interface Props {
  note: Note
  theme: Theme
  onChange: (changes: Partial<Note>) => void
}

export default function NoteEditor({ note, theme, onChange }: Props) {
  const isDark = theme === 'dark'
  const editor = isDark ? 'bg-[#1e1e2e] text-[#cdd6f4]' : 'bg-white text-[#4c4f69]'

  return (
    <div className={`flex-1 flex flex-col ${editor}`}>
      <div className={`px-8 py-4 border-b ${isDark ? 'border-[#313244]' : 'border-[#bcc0cc]'}`}>
        <input
          className={`w-full text-xl font-bold bg-transparent outline-none allow-select ${isDark ? 'text-[#cdd6f4]' : 'text-[#4c4f69]'}`}
          value={note.title}
          onChange={e => onChange({ title: e.target.value })}
          placeholder="Note title..."
        />
        <p className={`text-xs mt-1 ${isDark ? 'text-[#6c7086]' : 'text-[#9ca0b0]'}`}>
          Last edited {new Date(note.updated_at).toLocaleString()}
        </p>
      </div>
      <textarea
        className={`flex-1 p-8 pt-6 bg-transparent outline-none resize-none text-sm leading-relaxed allow-select ${isDark ? 'text-[#cdd6f4] placeholder-[#585b70]' : 'text-[#4c4f69] placeholder-[#9ca0b0]'}`}
        value={note.content}
        onChange={e => onChange({ content: e.target.value })}
        placeholder="Start writing..."
      />
    </div>
  )
}
