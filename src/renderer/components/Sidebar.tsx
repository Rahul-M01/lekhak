import { LayoutDashboard, CheckSquare, StickyNote, Bell, Sun, Moon } from 'lucide-react'
import type { View, Theme } from '../types'

interface SidebarProps {
  view: View
  setView: (v: View) => void
  theme: Theme
  toggleTheme: () => void
}

const navItems = [
  { id: 'dashboard' as View, icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'todos'     as View, icon: CheckSquare,     label: 'To-Do' },
  { id: 'notes'     as View, icon: StickyNote,      label: 'Notes' },
  { id: 'reminders' as View, icon: Bell,            label: 'Reminders' },
]

export default function Sidebar({ view, setView, theme, toggleTheme }: SidebarProps) {
  const isDark = theme === 'dark'
  
  // Minimalist high-contrast tokens
  const bg = 'bg-transparent'
  const active = 'bg-black text-white dark:bg-white dark:text-black shadow-md shadow-neutral-200/50 dark:shadow-none'
  const hover = 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
  const text = 'text-neutral-600 dark:text-neutral-400'

  return (
    <div className={`w-[220px] flex flex-col ${bg} pt-8 pb-4`}>
      <div className="px-6 mb-8">
        <h1 className="text-xl font-bold tracking-tight text-black dark:text-white">Lekhak.</h1>
        <p className={`text-xs mt-1 font-medium ${text}`}>productivity space</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all focus-ring ${
              view === id ? active : `${text} ${hover}`
            }`}
          >
            <Icon size={18} strokeWidth={view === id ? 2.5 : 2} />
            {label}
          </button>
        ))}
      </nav>

      <div className="px-4">
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${text} ${hover} transition-all focus-ring`}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </div>
  )
}
