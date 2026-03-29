import { useState, useEffect } from 'react'
import { Plus, Trash2, Calendar } from 'lucide-react'
import type { Todo, Theme } from '../../types'

interface Props { theme: Theme }

const priorityBg = {
  low: 'bg-green-400/10 text-green-400',
  medium: 'bg-yellow-400/10 text-yellow-400',
  high: 'bg-red-400/10 text-red-400',
}

export default function TodoList({ theme }: Props) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [newDue, setNewDue] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all')
  const isDark = theme === 'dark'

  const card = isDark ? 'bg-[#181825] border-[#313244]' : 'bg-white border-[#bcc0cc]'
  const input = isDark ? 'bg-[#313244] text-[#cdd6f4] placeholder-[#6c7086] border-[#45475a]' : 'bg-[#e6e9ef] text-[#4c4f69] placeholder-[#9ca0b0] border-[#bcc0cc]'

  useEffect(() => {
    window.api.todos.getAll().then(setTodos)
  }, [])

  const addTodo = async () => {
    if (!newTitle.trim()) return
    const todo = await window.api.todos.create({
      title: newTitle.trim(),
      priority: newPriority,
      due_date: newDue || null,
    })
    setTodos(prev => [todo, ...prev])
    setNewTitle('')
    setNewDue('')
    setNewPriority('medium')
  }

  const toggleTodo = async (id: number) => {
    const updated = await window.api.todos.toggle(id)
    setTodos(prev => prev.map(t => t.id === id ? updated : t))
  }

  const deleteTodo = async (id: number) => {
    await window.api.todos.delete(id)
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  const filtered = todos.filter(t =>
    filter === 'all' ? true : filter === 'active' ? !t.completed : t.completed
  )

  const active = todos.filter(t => !t.completed).length

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-6 pt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">To-Do List</h2>
          <p className={`text-sm ${isDark ? 'text-[#a6adc8]' : 'text-[#6c6f85]'}`}>{active} task{active !== 1 ? 's' : ''} remaining</p>
        </div>
        <div className="flex gap-1">
          {(['all', 'active', 'done'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? isDark ? 'bg-[#cba6f7] text-[#1e1e2e]' : 'bg-[#8839ef] text-white'
                  : isDark ? 'text-[#a6adc8] hover:bg-[#313244]' : 'text-[#6c6f85] hover:bg-[#c6cad8]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Add todo form */}
      <div className={`flex gap-2 mb-4 p-3 rounded-xl border ${card}`}>
        <input
          className={`flex-1 px-3 py-2 rounded-lg text-sm border outline-none ${input} allow-select`}
          placeholder="Add a new task..."
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
        />
        <select
          value={newPriority}
          onChange={e => setNewPriority(e.target.value as any)}
          className={`px-2 py-2 rounded-lg text-xs border outline-none ${input}`}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="date"
          value={newDue}
          onChange={e => setNewDue(e.target.value)}
          className={`px-2 py-2 rounded-lg text-xs border outline-none ${input}`}
        />
        <button
          onClick={addTodo}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isDark ? 'bg-[#cba6f7] text-[#1e1e2e] hover:bg-[#b89af4]' : 'bg-[#8839ef] text-white hover:bg-[#7425d6]'
          }`}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Todo list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.length === 0 && (
          <div className={`text-center py-16 ${isDark ? 'text-[#6c7086]' : 'text-[#9ca0b0]'}`}>
            <CheckSquareEmpty size={40} className="mx-auto mb-3 opacity-30" />
            <p>No tasks here</p>
          </div>
        )}
        {filtered.map(todo => (
          <div
            key={todo.id}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-opacity ${card} ${todo.completed ? 'opacity-60' : ''}`}
          >
            <button
              onClick={() => toggleTodo(todo.id)}
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
              onClick={() => deleteTodo(todo.id)}
              className={`p-1 rounded transition-colors ${isDark ? 'hover:text-red-400' : 'hover:text-red-500'}`}
              style={{ opacity: 0.3 }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.3')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function CheckSquareEmpty({ size, className }: { size: number, className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  )
}
