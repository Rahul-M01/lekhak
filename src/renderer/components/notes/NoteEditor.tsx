import { useEffect, useRef } from 'react'
import { X, ExternalLink, Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import type { Note } from '../../types'

interface Props {
  note: Note
  onChange: (changes: Partial<Note>) => void
  onClose?: () => void
  isPopup?: boolean
}

export default function NoteEditor({ note, onChange, onClose, isPopup = false }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: 'Start writing...' }),
    ],
    content: note.content,
    editorProps: {
      attributes: {
        class: 'flex-1 w-full outline-none prose prose-sm dark:prose-invert max-w-none allow-select',
      },
    },
    onUpdate: ({ editor }) => {
      onChange({ content: editor.getHTML() })
    },
  })

  // Update content when note changes (from sidebar click)
  useEffect(() => {
    if (editor && note.id) {
      // Small timeout to prevent tiptap internal state clash
      setTimeout(() => {
        if (note.content !== editor.getHTML()) {
          editor.commands.setContent(note.content, { emitUpdate: false })
        }
      }, 0)
    }
  }, [note.id, editor])

  const textMuted = 'text-neutral-500 dark:text-neutral-400'

  return (
    <div className={`flex-1 flex flex-col bg-white dark:bg-[#121212] h-full ${isPopup ? 'h-screen w-screen' : ''}`}>
      {isPopup && (
        <div className="titlebar-drag-region h-10 w-full absolute top-0 left-0 z-50"></div>
      )}
      
      <div className={`px-10 py-6 subtle-border border-b flex items-start gap-4 ${isPopup ? 'pt-12' : ''}`}>
        <div className="flex-1 min-w-0 z-10 relative">
          <input
            className="w-full text-2xl font-bold bg-transparent outline-none allow-select text-black dark:text-white placeholder-neutral-300 dark:placeholder-neutral-700 tracking-tight"
            value={note.title}
            onChange={e => onChange({ title: e.target.value })}
            placeholder="Note title..."
          />
          <p className={`text-xs font-medium mt-1.5 ${textMuted}`}>
            Last edited {new Date(note.updated_at).toLocaleString('en-GB')}
          </p>
        </div>
        
        <div className="flex gap-1.5 z-10 relative">
          {!isPopup && (
            <button
              onClick={() => window.api.window.openNote(note.id)}
              className="p-2 rounded-lg transition-colors text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white focus-ring"
              title="Open in new window"
            >
              <ExternalLink size={18} />
            </button>
          )}
          {onClose && !isPopup && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white focus-ring"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Formatting Toolbar */}
      {editor && (
        <div className="px-10 py-2 border-b subtle-border flex gap-1 items-center bg-neutral-50 dark:bg-[#0a0a0a]">
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded transition-colors ${editor.isActive('bold') ? 'bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white' : 'text-neutral-500 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'}`}>
            <Bold size={15} />
          </button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded transition-colors ${editor.isActive('italic') ? 'bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white' : 'text-neutral-500 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'}`}>
            <Italic size={15} />
          </button>
          <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded transition-colors ${editor.isActive('underline') ? 'bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white' : 'text-neutral-500 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'}`}>
            <span className="font-serif font-bold text-sm px-0.5 underline">U</span>
          </button>
          <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-1.5 rounded transition-colors ${editor.isActive('strike') ? 'bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white' : 'text-neutral-500 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'}`}>
            <Strikethrough size={15} />
          </button>
          <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1"></div>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-1.5 rounded transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white' : 'text-neutral-500 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'}`}>
            <Heading1 size={15} />
          </button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-1.5 rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white' : 'text-neutral-500 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'}`}>
            <Heading2 size={15} />
          </button>
          <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1"></div>
          <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded transition-colors ${editor.isActive('bulletList') ? 'bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white' : 'text-neutral-500 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'}`}>
            <List size={15} />
          </button>
          <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded transition-colors ${editor.isActive('orderedList') ? 'bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white' : 'text-neutral-500 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'}`}>
            <ListOrdered size={15} />
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto px-10 py-6 text-black dark:text-neutral-100 tiptap-container">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
