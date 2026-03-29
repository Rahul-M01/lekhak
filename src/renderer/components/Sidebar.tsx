import { CheckSquare, StickyNote, Bell, Sun, Moon } from 'lucide-react'
import type { View, Theme } from '../types'

interface SidebarProps {
  view: View
  setView: (v: View) => void
  theme: Theme
  toggleTheme: () => void
}

const navItems = [
  { id: 'todos' as View, icon: CheckSquare, label: 'To-Do' },
  { id: 'notes' as View, icon: StickyNote, label: 'Notes' },
  { id: 'reminders' as View, icon: Bell, label: 'Reminders' },
]

export default function Sidebar({ view, setView, theme, toggleTheme }: SidebarProps) {
  const isDark = theme === 'dark'
  const bg = isDark ? 'bg-[#181825]' : 'bg-[#dce0e8]'
  const active = isDark ? 'bg-[#313244] text-[#cba6f7]' : 'bg-[#c6cad8] text-[#8839ef]'
  const hover = isDark ? 'hover:bg-[#313244]/60' : 'hover:bg-[#c6cad8]/60'
  const text = isDark ? 'text-[#a6adc8]' : 'text-[#6c6f85]'

  return (
    <div className={`w-[200px] flex flex-col ${bg} border-r ${isDark ? 'border-[#313244]' : 'border-[#bcc0cc]'} pt-10`}>
      <div className="px-4 mb-6">
        <h1 className={`text-lg font-bold ${isDark ? 'text-[#cba6f7]' : 'text-[#8839ef]'}`}>Lekhak</h1>
        <p className={`text-xs ${text}`}>Your productivity hub</p>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              view === id ? active : `${text} ${hover}`
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      <div className={`p-4 border-t ${isDark ? 'border-[#313244]' : 'border-[#bcc0cc]'}`}>
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${text} ${hover} transition-colors`}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </div>
  )
}
