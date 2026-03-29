import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import TodoList from './components/todos/TodoList'
import NotesList from './components/notes/NotesList'
import ReminderList from './components/reminders/ReminderList'
import type { View, Theme } from './types'

export default function App() {
  const [view, setView] = useState<View>('todos')
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${theme === 'dark' ? 'bg-[#1e1e2e] text-[#cdd6f4]' : 'bg-[#eff1f5] text-[#4c4f69]'}`}>
      {/* Custom title bar area - electron handles the overlay */}
      <Sidebar view={view} setView={setView} theme={theme} toggleTheme={toggleTheme} />
      <main className="flex-1 overflow-hidden flex flex-col">
        {view === 'todos' && <TodoList theme={theme} />}
        {view === 'notes' && <NotesList theme={theme} />}
        {view === 'reminders' && <ReminderList theme={theme} />}
      </main>
    </div>
  )
}
