import { useState, useEffect, useCallback } from 'react'
import type { Todo, Note, Reminder } from '../types'

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await window.api.todos.getAll()
    setTodos(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const create = async (data: Partial<Todo>) => {
    const todo = await window.api.todos.create(data)
    setTodos(prev => [todo, ...prev])
    return todo
  }

  const update = async (id: number, data: Partial<Todo>) => {
    const updated = await window.api.todos.update(id, data)
    setTodos(prev => prev.map(t => t.id === id ? updated : t))
    return updated
  }

  const remove = async (id: number) => {
    await window.api.todos.delete(id)
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  const toggle = async (id: number) => {
    const updated = await window.api.todos.toggle(id)
    setTodos(prev => prev.map(t => t.id === id ? updated : t))
    return updated
  }

  return { todos, loading, create, update, remove, toggle, reload: load }
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await window.api.notes.getAll()
    setNotes(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const create = async (data: Partial<Note>) => {
    const note = await window.api.notes.create(data)
    setNotes(prev => [note, ...prev])
    return note
  }

  const update = async (id: number, data: Partial<Note>) => {
    const updated = await window.api.notes.update(id, data)
    setNotes(prev => prev.map(n => n.id === id ? updated : n))
    return updated
  }

  const remove = async (id: number) => {
    await window.api.notes.delete(id)
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  const togglePin = async (id: number) => {
    const updated = await window.api.notes.togglePin(id)
    setNotes(prev => {
      const next = prev.map(n => n.id === id ? updated : n)
      next.sort((a, b) => b.pinned - a.pinned || new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      return next
    })
    return updated
  }

  return { notes, loading, create, update, remove, togglePin, reload: load }
}

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await window.api.reminders.getAll()
    setReminders(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const create = async (data: Partial<Reminder>) => {
    const reminder = await window.api.reminders.create(data)
    setReminders(prev => [...prev, reminder].sort((a, b) =>
      new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime()
    ))
    return reminder
  }

  const update = async (id: number, data: Partial<Reminder>) => {
    const updated = await window.api.reminders.update(id, data)
    setReminders(prev => prev.map(r => r.id === id ? updated : r))
    return updated
  }

  const remove = async (id: number) => {
    await window.api.reminders.delete(id)
    setReminders(prev => prev.filter(r => r.id !== id))
  }

  const complete = async (id: number) => {
    const updated = await window.api.reminders.complete(id)
    setReminders(prev => prev.map(r => r.id === id ? updated : r))
    return updated
  }

  return { reminders, loading, create, update, remove, complete, reload: load }
}
