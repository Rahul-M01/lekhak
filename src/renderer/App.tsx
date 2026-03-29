import { useState, useEffect, useRef } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/dashboard/Dashboard'
import TodoList from './components/todos/TodoList'
import NotesList from './components/notes/NotesList'
import NoteEditor from './components/notes/NoteEditor'
import ReminderList from './components/reminders/ReminderList'
import type { View, Theme, Note } from './types'

export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const [theme, setTheme] = useState<Theme>('dark')

  // Support for open-in-new-window popup instances
  const urlParams = new URLSearchParams(window.location.search)
  const popupNoteId = urlParams.get('noteId')
  const [popupNote, setPopupNote] = useState<Note | null>(null)
  const popupSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const loadPopupNote = () => {
      if (popupNoteId) {
        window.api.notes.getAll().then(notes => {
          const found = notes.find(n => n.id === Number(popupNoteId))
          if (found) setPopupNote(found)
        })
      }
    }
    loadPopupNote()
    window.addEventListener('focus', loadPopupNote)
    return () => window.removeEventListener('focus', loadPopupNote)
  }, [popupNoteId])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  if (popupNote) {
    return (
      <div className={`flex h-screen w-screen overflow-hidden ${theme === 'dark' ? 'bg-[#121212] text-white' : 'bg-white text-black'} selection:bg-neutral-800 selection:text-white dark:selection:bg-neutral-200 dark:selection:text-black`}>
        <NoteEditor
          note={popupNote}
          isPopup={true}
          onChange={(changes) => {
            setPopupNote(prev => prev ? { ...prev, ...changes } : null)
            if (popupSaveTimer.current) clearTimeout(popupSaveTimer.current)
            popupSaveTimer.current = setTimeout(() => {
              window.api.notes.update(Number(popupNoteId), changes)
            }, 600)
          }}
        />
      </div>
    )
  }

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${theme === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-[#fdfdfd] text-black'} selection:bg-neutral-800 selection:text-white dark:selection:bg-neutral-200 dark:selection:text-black`}>
      <Sidebar view={view} setView={setView} theme={theme} toggleTheme={toggleTheme} />
      <main className="flex-1 overflow-hidden flex flex-col bg-surface-light dark:bg-surface-dark m-2 rounded-xl subtle-border border shadow-sm relative">
        <div className="absolute inset-0 z-0 pointer-events-none subtle-bg opacity-50"></div>
        <div className="relative z-10 flex-col flex h-full">
          {view === 'dashboard' && <Dashboard theme={theme} setView={setView} />}
          {view === 'todos'     && <TodoList theme={theme} />}
          {view === 'notes'     && <NotesList theme={theme} />}
          {view === 'reminders' && <ReminderList theme={theme} />}
        </div>
      </main>
    </div>
  )
}
