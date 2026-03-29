export interface Todo {
  id: number
  title: string
  description: string
  completed: number
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface Note {
  id: number
  title: string
  content: string
  color: string
  pinned: number
  created_at: string
  updated_at: string
}

export interface Reminder {
  id: number
  title: string
  description: string
  remind_at: string
  repeat: 'none' | 'daily' | 'weekly' | 'monthly'
  completed: number
  notified: number
  created_at: string
}

export type View = 'dashboard' | 'todos' | 'notes' | 'reminders'
export type Theme = 'dark' | 'light'

declare global {
  interface Window {
    api: {
      todos: {
        getAll(): Promise<Todo[]>
        create(data: Partial<Todo>): Promise<Todo>
        update(id: number, data: Partial<Todo>): Promise<Todo>
        delete(id: number): Promise<{ success: boolean }>
        toggle(id: number): Promise<Todo>
      }
      notes: {
        getAll(): Promise<Note[]>
        create(data: Partial<Note>): Promise<Note>
        update(id: number, data: Partial<Note>): Promise<Note>
        delete(id: number): Promise<{ success: boolean }>
        togglePin(id: number): Promise<Note>
      }
      reminders: {
        getAll(): Promise<Reminder[]>
        create(data: Partial<Reminder>): Promise<Reminder>
        update(id: number, data: Partial<Reminder>): Promise<Reminder>
        delete(id: number): Promise<{ success: boolean }>
        complete(id: number): Promise<Reminder>
      }
      window: {
        minimize(): void
        maximize(): void
        close(): void
        openNote(id: number): void
      }
    }
  }
}
