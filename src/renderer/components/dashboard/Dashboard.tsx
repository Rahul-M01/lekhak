import { useState, useEffect } from 'react'
import { CheckSquare, StickyNote, Bell, ArrowRight, Flag } from 'lucide-react'
import type { Todo, Note, Reminder, Theme, View } from '../../types'
import { isToday, isTomorrow, format } from 'date-fns'

interface Props {
  theme: Theme
  setView: (v: View) => void
}

export default function Dashboard({ theme, setView }: Props) {
  const [todos, setTodos]         = useState<Todo[]>([])
  const [notes, setNotes]         = useState<Note[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const isDark = theme === 'dark'

  const sub   = 'text-neutral-500 dark:text-neutral-400'
  const card  = 'bg-white dark:bg-[#121212] subtle-border border'
  const muted = 'text-neutral-400 dark:text-neutral-500'

  useEffect(() => {
    Promise.all([
      window.api.todos.getAll(),
      window.api.notes.getAll(),
      window.api.reminders.getAll(),
    ]).then(([t, n, r]) => { setTodos(t); setNotes(n); setReminders(r) })
  }, [])

  const activeTodos  = todos.filter(t => !t.completed)
  const overdueTodos = activeTodos.filter(t => t.due_date && new Date(t.due_date) < new Date())
  const upcomingReminders = reminders
    .filter(r => !r.completed)
    .sort((a, b) => new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime())
    .slice(0, 5)

  const getTimeLabel = (dt: string) => {
    const d = new Date(dt)
    if (isToday(d))    return `Today ${format(d, 'h:mm a')}`
    if (isTomorrow(d)) return `Tomorrow ${format(d, 'h:mm a')}`
    return format(d, 'd MMM yyyy')
  }

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const stats = [
    { label: 'Tasks left', value: activeTodos.length,      icon: CheckSquare, view: 'todos'     as View },
    { label: 'Notes',      value: notes.length,             icon: StickyNote,  view: 'notes'     as View },
    { label: 'Reminders',  value: upcomingReminders.length, icon: Bell,        view: 'reminders' as View },
    { label: 'Overdue',    value: overdueTodos.length,      icon: Flag,        view: 'todos' as View, isAlert: overdueTodos.length > 0 },
  ]

  return (
    <div className="flex-1 overflow-y-auto px-8 py-10 allow-select">
      {/* Greeting */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">{greeting}</h2>
        <p className={`text-sm mt-2 font-medium ${sub}`}>
          {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, view, isAlert }) => (
          <button
            key={label}
            onClick={() => setView(view)}
            className={`p-6 rounded-2xl text-left card-hover focus-ring ${card} ${isAlert ? 'border-red-500 dark:border-red-500' : ''}`}
          >
            <Icon size={20} className={`mb-4 ${isAlert ? 'text-red-500' : 'text-neutral-800 dark:text-neutral-200'}`} />
            <p className={`text-4xl font-bold mb-1 ${isAlert ? 'text-red-500' : 'text-black dark:text-white'}`}>{value}</p>
            <p className={`text-xs font-semibold uppercase tracking-wider ${sub}`}>{label}</p>
          </button>
        ))}
      </div>

      {/* Lower two-col grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Active tasks */}
        <div className={`rounded-2xl p-6 ${card}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-black dark:text-white">Active Tasks</h3>
            <button onClick={() => setView('todos')} className={`text-xs font-semibold flex items-center gap-1 ${sub} hover:text-black dark:hover:text-white transition-colors focus-ring rounded`}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          {activeTodos.length === 0 ? (
            <p className={`text-sm ${muted} py-6 text-center italic`}>All done!</p>
          ) : (
            <div className="space-y-4">
              {activeTodos.slice(0, 5).map(todo => (
                <div key={todo.id} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    todo.priority === 'high' ? 'bg-red-500' : todo.priority === 'medium' ? 'bg-amber-500' : 'bg-neutral-800 dark:bg-neutral-200'
                  }`} />
                  <p className="text-sm font-medium truncate flex-1 text-neutral-800 dark:text-neutral-200">{todo.title}</p>
                  {todo.due_date && (
                    <span className={`text-xs flex-shrink-0 font-medium ${muted}`}>
                      {new Date(todo.due_date).toLocaleDateString('en-GB')}
                    </span>
                  )}
                </div>
              ))}
              {activeTodos.length > 5 && (
                 <button onClick={() => setView('todos')} className={`text-xs font-medium w-full text-center ${sub} hover:text-black dark:hover:text-white pt-2 transition-colors`}>
                   +{activeTodos.length - 5} more
                 </button>
              )}
            </div>
          )}
        </div>

        {/* Upcoming reminders */}
        <div className={`rounded-2xl p-6 ${card}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-black dark:text-white">Upcoming Reminders</h3>
            <button onClick={() => setView('reminders')} className={`text-xs font-semibold flex items-center gap-1 ${sub} hover:text-black dark:hover:text-white transition-colors focus-ring rounded`}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          {upcomingReminders.length === 0 ? (
            <p className={`text-sm ${muted} py-6 text-center italic`}>Nothing scheduled</p>
          ) : (
            <div className="space-y-4">
              {upcomingReminders.map(r => (
                <div key={r.id} className="flex items-center gap-3">
                  <Bell size={14} className="flex-shrink-0 text-neutral-800 dark:text-neutral-200" />
                  <p className="text-sm font-medium truncate flex-1 text-neutral-800 dark:text-neutral-200">{r.title}</p>
                  <span className={`text-xs flex-shrink-0 font-medium ${muted}`}>{getTimeLabel(r.remind_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent notes — full width */}
      <div className={`rounded-2xl p-6 ${card}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-black dark:text-white">Recent Notes</h3>
          <button onClick={() => setView('notes')} className={`text-xs font-semibold flex items-center gap-1 ${sub} hover:text-black dark:hover:text-white transition-colors focus-ring rounded`}>
            View all <ArrowRight size={14} />
          </button>
        </div>
        {notes.length === 0 ? (
          <p className={`text-sm ${muted} py-4 text-center italic`}>No notes yet</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {notes.slice(0, 3).map(note => (
              <button
                key={note.id}
                onClick={() => setView('notes')}
                className={`p-5 rounded-xl text-left border subtle-border card-hover subtle-bg focus-ring`}
              >
                <p className="text-sm font-semibold truncate mb-1 text-black dark:text-white">{note.title || 'Untitled'}</p>
                <p className={`text-xs truncate ${sub}`}>{note.content || 'Empty note'}</p>
                <p className={`text-[11px] font-medium mt-3 ${muted}`}>{new Date(note.updated_at).toLocaleDateString('en-GB')}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
