import { useState, useEffect } from 'react'
import { Plus, Trash2, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import type { Todo, Theme } from '../../types'

interface Props { theme: Theme }

const priorityBg = {
  low: 'bg-green-500/10 text-green-600 dark:text-green-400',
  medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  high: 'bg-red-500/10 text-red-600 dark:text-red-400',
}

export default function TodoList({ theme }: Props) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [newDue, setNewDue] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all')

  const card = 'bg-white dark:bg-[#121212] subtle-border border shadow-sm'
  const inputStyling = 'bg-neutral-100/50 dark:bg-[#1a1a1a] text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 subtle-border'

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
    <div className="flex-1 overflow-hidden flex flex-col p-8 pt-12 allow-select">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">To-Do List</h2>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">{active} task{active !== 1 ? 's' : ''} remaining</p>
        </div>
        <div className="flex gap-1 bg-neutral-100 dark:bg-[#1a1a1a] p-1 rounded-lg border subtle-border">
          {(['all', 'active', 'done'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-all focus-ring ${
                filter === f
                  ? 'bg-white text-black dark:bg-[#262626] dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Add todo form */}
      <div className={`flex items-center gap-2 mb-6 p-2 rounded-xl focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white transition-shadow ${card}`}>
        <input
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm bg-transparent outline-none text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500`}
          placeholder="What needs to be done?"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
        />
        <select
          value={newPriority}
          onChange={e => setNewPriority(e.target.value as any)}
          className={`px-3 py-2.5 rounded-lg text-sm font-medium border outline-none cursor-pointer focus-ring ${inputStyling}`}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="date"
          value={newDue}
          onChange={e => setNewDue(e.target.value)}
          className={`px-3 py-2.5 rounded-lg text-sm font-medium border outline-none cursor-pointer focus-ring ${inputStyling}`}
        />
        <button
          onClick={addTodo}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all focus-ring bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Todo list */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {filtered.length === 0 && (
          <div className="text-center py-20 text-neutral-400 dark:text-neutral-500">
            <CheckSquareEmpty size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">No tasks here</p>
          </div>
        )}
        {filtered.map(todo => (
          <div
            key={todo.id}
            className={`flex items-start gap-4 p-4 rounded-xl transition-all card-hover ${card} ${todo.completed ? 'opacity-60 bg-neutral-50 dark:bg-[#0a0a0a]' : ''}`}
          >
            <button
              onClick={() => toggleTodo(todo.id)}
              className={`mt-0.5 w-6 h-6 rounded-full border-[2px] flex-shrink-0 flex items-center justify-center transition-all focus-ring ${
                todo.completed
                  ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black shadow-sm'
                  : 'border-neutral-300 dark:border-neutral-600 hover:border-black dark:hover:border-white'
              }`}
            >
              {todo.completed && (
                <svg viewBox="0 0 10 10" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2,5 4,7 8,3" />
                </svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-[15px] font-semibold text-black dark:text-white transition-opacity ${todo.completed ? 'line-through opacity-70' : ''}`}>{todo.title}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${priorityBg[todo.priority]}`}>
                  {todo.priority}
                </span>
                {todo.due_date && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    <Calendar size={12} />
                    {format(new Date(todo.due_date), 'dd/MM')}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="p-1.5 rounded-md transition-colors text-neutral-400 hover:text-red-500 hover:bg-red-500/10 dark:text-neutral-500 dark:hover:text-red-400 focus-ring"
            >
              <Trash2 size={16} />
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
