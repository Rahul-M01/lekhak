import { useState } from 'react'
import type { Reminder, Theme } from '../../types'

interface Props {
  theme: Theme
  onSave: (data: Partial<Reminder>) => void
  onCancel: () => void
}

export default function ReminderForm({ theme, onSave, onCancel }: Props) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    remind_at: '',
    repeat: 'none' as Reminder['repeat']
  })
  const isDark = theme === 'dark'

  const card = isDark ? 'bg-[#181825] border-[#313244]' : 'bg-white border-[#bcc0cc]'
  const input = isDark ? 'bg-[#313244] text-[#cdd6f4] placeholder-[#6c7086] border-[#45475a]' : 'bg-[#e6e9ef] text-[#4c4f69] placeholder-[#9ca0b0] border-[#bcc0cc]'

  const submit = () => {
    if (!form.title.trim() || !form.remind_at) return
    onSave(form)
  }

  return (
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
        <button
          onClick={onCancel}
          className={`px-4 py-2 rounded-lg text-sm ${isDark ? 'text-[#a6adc8] hover:bg-[#313244]' : 'text-[#6c6f85] hover:bg-[#c6cad8]'}`}
        >
          Cancel
        </button>
        <button
          onClick={submit}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-[#cba6f7] text-[#1e1e2e]' : 'bg-[#8839ef] text-white'}`}
        >
          Save
        </button>
      </div>
    </div>
  )
}
