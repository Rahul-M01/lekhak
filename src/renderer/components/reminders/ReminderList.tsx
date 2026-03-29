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
  const isDark = theme === 'dark'

  const card = isDark ? 'bg-[#181825] border-[#313244]' : 'bg-white border-[#bcc0cc]'
  const input = isDark ? 'bg-[#313244] text-[#cdd6f4] placeholder-[#6c7086] border-[#45475a]' : 'bg-[#e6e9ef] text-[#4c4f69] placeholder-[#9ca0b0] border-[#bcc0cc]'

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
    return format(d, 'MMM d, yyyy h:mm a')
  }

  const isOverdue = (r: Reminder) => !r.completed && isPast(new Date(r.remind_at))

  const filtered = reminders.filter(r =>
    filter === 'upcoming' ? !r.completed
    : filter === 'done' ? r.completed
    : true
  )

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-6 pt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Reminders</h2>
          <p className={`text-sm ${isDark ? 'text-[#a6adc8]' : 'text-[#6c6f85]'}`}>
            {reminders.filter(r => !r.completed).length} upcoming
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex gap-1">
            {(['upcoming', 'all', 'done'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                  filter === f
                    ? isDark ? 'bg-[#cba6f7] text-[#1e1e2e]' : 'bg-[#8839ef] text-white'
                    : isDark ? 'text-[#a6adc8] hover:bg-[#313244]' : 'text-[#6c6f85] hover:bg-[#c6cad8]'
                }`}>
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDark ? 'bg-[#cba6f7] text-[#1e1e2e] hover:bg-[#b89af4]' : 'bg-[#8839ef] text-white hover:bg-[#7425d6]'
            }`}
          >
            <Plus size={16} /> Add Reminder
          </button>
        </div>
      </div>

      {showForm && (
        <div className={`p-4 rounded-xl border mb-4 space-y-3 ${card}`}>
          <h3 className="font-semibold text-sm">New Reminder</h3>
          <input
            className={`w-full px-3 py-2 rounded-lg text-sm border outline-none allow-select ${input}`}
            placeholder="Reminder title..."
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
          <input
            className={`w-full px-3 py-2 rounded-lg text-sm border outline-none allow-select ${input}`}
            placeholder="Description (optional)..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <div className="flex gap-2">
            <input
              type="datetime-local"
              className={`flex-1 px-3 py-2 rounded-lg text-sm border outline-none ${input}`}
              value={form.remind_at}
              onChange={e => setForm(f => ({ ...f, remind_at: e.target.value }))}
            />
            <select
              value={form.repeat}
              onChange={e => setForm(f => ({ ...f, repeat: e.target.value as any }))}
              className={`px-3 py-2 rounded-lg text-sm border outline-none ${input}`}
            >
              <option value="none">No repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className={`px-4 py-2 rounded-lg text-sm ${isDark ? 'text-[#a6adc8] hover:bg-[#313244]' : 'text-[#6c6f85] hover:bg-[#c6cad8]'}`}>Cancel</button>
            <button onClick={submit} className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-[#cba6f7] text-[#1e1e2e]' : 'bg-[#8839ef] text-white'}`}>Save</button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.length === 0 && (
          <div className={`text-center py-16 ${isDark ? 'text-[#6c7086]' : 'text-[#9ca0b0]'}`}>
            <Bell size={40} className="mx-auto mb-3 opacity-30" />
            <p>No reminders</p>
          </div>
        )}
        {filtered.map(r => (
          <div key={r.id} className={`flex items-start gap-3 p-4 rounded-xl border ${card} ${r.completed ? 'opacity-50' : ''}`}>
            <div className={`mt-0.5 p-1.5 rounded-lg ${
              isOverdue(r) ? 'bg-red-400/20 text-red-400'
              : r.completed ? isDark ? 'bg-[#a6e3a1]/20 text-[#a6e3a1]' : 'bg-green-500/20 text-green-500'
              : isDark ? 'bg-[#cba6f7]/20 text-[#cba6f7]' : 'bg-[#8839ef]/20 text-[#8839ef]'
            }`}>
              {r.completed ? <Check size={14} /> : isOverdue(r) ? <Clock size={14} /> : <Bell size={14} />}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${r.completed ? 'line-through opacity-60' : ''}`}>{r.title}</p>
              {r.description && <p className={`text-xs mt-0.5 ${isDark ? 'text-[#a6adc8]' : 'text-[#6c6f85]'}`}>{r.description}</p>}
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-xs ${isOverdue(r) && !r.completed ? 'text-red-400 font-medium' : isDark ? 'text-[#6c7086]' : 'text-[#9ca0b0]'}`}>
                  {getTimeLabel(r.remind_at)}
                </span>
                {r.repeat !== 'none' && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-[#313244] text-[#a6adc8]' : 'bg-[#e6e9ef] text-[#6c6f85]'}`}>
                    {r.repeat}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              {!r.completed && (
                <button onClick={() => complete(r.id)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-[#a6e3a1]/20 hover:text-[#a6e3a1]' : 'hover:bg-green-100 hover:text-green-600'}`}>
                  <Check size={14} />
                </button>
              )}
              <button onClick={() => deleteR(r.id)} className="p-1.5 rounded-lg hover:text-red-400 transition-colors opacity-40 hover:opacity-100">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
