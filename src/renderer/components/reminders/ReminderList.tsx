import { useState, useEffect } from 'react'
import { Plus, Trash2, Check, Bell, Clock } from 'lucide-react'
import type { Reminder, Theme } from '../../types'
import { format, isPast, isToday, isTomorrow } from 'date-fns'

interface Props { theme: Theme }

export default function ReminderList({ theme }: Props) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', remind_at: '', repeat: 'none' as Reminder['repeat'] })
  const [filter, setFilter] = useState<'upcoming' | 'all' | 'done'>('upcoming')

  const card = 'bg-white dark:bg-[#121212] subtle-border border shadow-sm'
  const inputStyling = 'bg-neutral-100/50 dark:bg-[#1a1a1a] text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 subtle-border'
  const textMuted = 'text-neutral-500 dark:text-neutral-400'

  useEffect(() => {
    window.api.reminders.getAll().then(setReminders)
  }, [])

  const submit = async () => {
    if (!form.title.trim() || !form.remind_at) return
    const r = await window.api.reminders.create(form)
    setReminders(prev => [...prev, r].sort((a, b) => new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime()))
    setForm({ title: '', description: '', remind_at: '', repeat: 'none' })
    setShowForm(false)
  }

  const complete = async (id: number) => {
    const updated = await window.api.reminders.complete(id)
    setReminders(prev => prev.map(r => r.id === id ? updated : r))
  }

  const deleteR = async (id: number) => {
    await window.api.reminders.delete(id)
    setReminders(prev => prev.filter(r => r.id !== id))
  }

  const getTimeLabel = (dt: string) => {
    const d = new Date(dt)
    if (isToday(d)) return `Today ${format(d, 'h:mm a')}`
    if (isTomorrow(d)) return `Tomorrow ${format(d, 'h:mm a')}`
    return format(d, 'd MMM yyyy h:mm a')
  }

  const isOverdue = (r: Reminder) => !r.completed && isPast(new Date(r.remind_at))

  const filtered = reminders.filter(r =>
    filter === 'upcoming' ? !r.completed
    : filter === 'done' ? r.completed
    : true
  )

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-8 pt-12 allow-select">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">Reminders</h2>
          <p className={`text-sm font-medium mt-1 ${textMuted}`}>
            {reminders.filter(r => !r.completed).length} upcoming
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex gap-1 bg-neutral-100 dark:bg-[#1a1a1a] p-1 rounded-lg border subtle-border">
            {(['upcoming', 'all', 'done'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-all focus-ring ${
                  filter === f
                    ? 'bg-white text-black dark:bg-[#262626] dark:text-white shadow-sm'
                    : 'text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white'
                }`}>
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all focus-ring bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            <Plus size={16} /> Add 
          </button>
        </div>
      </div>

      {showForm && (
        <div className={`p-6 rounded-xl border mb-6 space-y-4 ${card} animate-[fadeIn_0.2s_ease-out]`}>
          <h3 className="font-bold text-[15px] text-black dark:text-white">New Reminder</h3>
          <input
            className={`w-full px-4 py-2.5 rounded-lg text-sm border outline-none font-medium focus-ring ${inputStyling}`}
            placeholder="Reminder title..."
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
          <input
            className={`w-full px-4 py-2.5 rounded-lg text-sm border outline-none font-medium focus-ring ${inputStyling}`}
            placeholder="Description (optional)..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <div className="flex gap-3">
            <input
              type="datetime-local"
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border outline-none cursor-pointer focus-ring ${inputStyling}`}
              value={form.remind_at}
              onChange={e => setForm(f => ({ ...f, remind_at: e.target.value }))}
            />
            <select
              value={form.repeat}
              onChange={e => setForm(f => ({ ...f, repeat: e.target.value as any }))}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium border outline-none cursor-pointer focus-ring ${inputStyling}`}
            >
              <option value="none">No repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold focus-ring text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors">Cancel</button>
            <button onClick={submit} className="px-5 py-2.5 rounded-lg text-sm font-semibold focus-ring transition-all bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200">Save Reminder</button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-6">
        {filtered.length === 0 && (
          <div className="text-center py-20 text-neutral-400 dark:text-neutral-500">
            <Bell size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">No reminders</p>
          </div>
        )}
        {filtered.map(r => (
          <div key={r.id} className={`flex items-start gap-4 p-5 rounded-xl border transition-all card-hover ${card} ${r.completed ? 'opacity-50 bg-neutral-50 dark:bg-[#0a0a0a]' : ''}`}>
            <div className={`mt-0.5 p-2 rounded-xl flex-shrink-0 border ${
              isOverdue(r) ? 'bg-red-500 text-white border-red-500'
              : r.completed ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
              : 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border-neutral-200 dark:border-neutral-700'
            }`}>
              {r.completed ? <Check size={16} strokeWidth={2.5} /> : isOverdue(r) ? <Clock size={16} strokeWidth={2.5} /> : <Bell size={16} strokeWidth={2.5} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[15px] font-semibold text-black dark:text-white ${r.completed ? 'line-through opacity-70' : ''}`}>{r.title}</p>
              {r.description && <p className={`text-[13px] mt-1 pr-4 truncate ${textMuted}`}>{r.description}</p>}
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-[11px] font-bold tracking-wide uppercase ${isOverdue(r) && !r.completed ? 'text-red-500' : 'text-neutral-400 dark:text-neutral-500'}`}>
                  {getTimeLabel(r.remind_at)}
                </span>
                {r.repeat !== 'none' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border subtle-border subtle-bg text-neutral-600 dark:text-neutral-300">
                    {r.repeat}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              {!r.completed && (
                <button onClick={() => complete(r.id)} className="p-2 rounded-lg transition-colors focus-ring text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white">
                  <Check size={16} strokeWidth={2.5} />
                </button>
              )}
              <button onClick={() => deleteR(r.id)} className="p-2 rounded-lg transition-colors focus-ring text-neutral-400 hover:text-red-500 hover:bg-red-500/10 dark:text-neutral-500 dark:hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
