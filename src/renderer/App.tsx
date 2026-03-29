import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/dashboard/Dashboard'
import TodoList from './components/todos/TodoList'
import NotesList from './components/notes/NotesList'
import ReminderList from './components/reminders/ReminderList'
import type { View, Theme } from './types'

export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${theme === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-[#fdfdfd] text-black'} selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black`}>
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
