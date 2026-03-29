import { Trash2, Calendar } from 'lucide-react'
import type { Todo, Theme } from '../../types'

interface Props {
  todo: Todo
  theme: Theme
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

const priorityBg = {
  low: 'bg-green-400/10 text-green-400',
  medium: 'bg-yellow-400/10 text-yellow-400',
  high: 'bg-red-400/10 text-red-400',
}

export default function TodoItem({ todo, theme, onToggle, onDelete }: Props) {
  const isDark = theme === 'dark'
  const card = isDark ? 'bg-[#181825] border-[#313244]' : 'bg-white border-[#bcc0cc]'

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border transition-opacity ${card} ${todo.completed ? 'opacity-60' : ''}`}
    >
      <button
        onClick={() => onToggle(todo.id)}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          todo.completed
            ? isDark ? 'bg-[#a6e3a1] border-[#a6e3a1]' : 'bg-[#40a02b] border-[#40a02b]'
            : isDark ? 'border-[#585b70]' : 'border-[#9ca0b0]'
        }`}
      >
        {todo.completed && (
          <svg viewBox="0 0 10 10" className="w-3 h-3 text-[#1e1e2e]" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1.5,5 4,7.5 8.5,2" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${todo.completed ? 'line-through opacity-60' : ''}`}>{todo.title}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full ${priorityBg[todo.priority]}`}>
            {todo.priority}
          </span>
          {todo.due_date && (
            <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-[#a6adc8]' : 'text-[#6c6f85]'}`}>
              <Calendar size={10} />
              {new Date(todo.due_date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        className={`p-1 rounded transition-colors ${isDark ? 'hover:text-red-400' : 'hover:text-red-500'}`}
        style={{ opacity: 0.3 }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.3')}
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
