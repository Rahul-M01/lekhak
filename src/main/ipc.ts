import { ipcMain } from 'electron'
import { getDb } from './database'

export function registerIpcHandlers() {
  const db = getDb()

  // ---- TODOS ----
  ipcMain.handle('todos:getAll', () => {
    return db.prepare('SELECT * FROM todos ORDER BY completed ASC, created_at DESC').all()
  })

  ipcMain.handle('todos:create', (_e, data) => {
    const stmt = db.prepare(
      'INSERT INTO todos (title, description, priority, due_date) VALUES (?, ?, ?, ?)'
    )
    const result = stmt.run(data.title, data.description || '', data.priority || 'medium', data.due_date || null)
    return db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid)
  })

  ipcMain.handle('todos:update', (_e, id, data) => {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ')
    const values = Object.values(data)
    db.prepare(`UPDATE todos SET ${fields}, updated_at = datetime('now') WHERE id = ?`).run(...values, id)
    return db.prepare('SELECT * FROM todos WHERE id = ?').get(id)
  })

  ipcMain.handle('todos:delete', (_e, id) => {
    db.prepare('DELETE FROM todos WHERE id = ?').run(id)
    return { success: true }
  })

  ipcMain.handle('todos:toggle', (_e, id) => {
    db.prepare("UPDATE todos SET completed = NOT completed, updated_at = datetime('now') WHERE id = ?").run(id)
    return db.prepare('SELECT * FROM todos WHERE id = ?').get(id)
  })

  // ---- NOTES ----
  ipcMain.handle('notes:getAll', () => {
    return db.prepare('SELECT * FROM notes ORDER BY pinned DESC, updated_at DESC').all()
  })

  ipcMain.handle('notes:create', (_e, data) => {
    const stmt = db.prepare('INSERT INTO notes (title, content, color) VALUES (?, ?, ?)')
    const result = stmt.run(data.title || 'Untitled', data.content || '', data.color || '#1e1e2e')
    return db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid)
  })

  ipcMain.handle('notes:update', (_e, id, data) => {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ')
    const values = Object.values(data)
    db.prepare(`UPDATE notes SET ${fields}, updated_at = datetime('now') WHERE id = ?`).run(...values, id)
    return db.prepare('SELECT * FROM notes WHERE id = ?').get(id)
  })

  ipcMain.handle('notes:delete', (_e, id) => {
    db.prepare('DELETE FROM notes WHERE id = ?').run(id)
    return { success: true }
  })

  ipcMain.handle('notes:togglePin', (_e, id) => {
    db.prepare("UPDATE notes SET pinned = NOT pinned, updated_at = datetime('now') WHERE id = ?").run(id)
    return db.prepare('SELECT * FROM notes WHERE id = ?').get(id)
  })

  // ---- REMINDERS ----
  ipcMain.handle('reminders:getAll', () => {
    return db.prepare('SELECT * FROM reminders ORDER BY remind_at ASC').all()
  })

  ipcMain.handle('reminders:create', (_e, data) => {
    const stmt = db.prepare(
      'INSERT INTO reminders (title, description, remind_at, repeat) VALUES (?, ?, ?, ?)'
    )
    const result = stmt.run(data.title, data.description || '', data.remind_at, data.repeat || 'none')
    return db.prepare('SELECT * FROM reminders WHERE id = ?').get(result.lastInsertRowid)
  })

  ipcMain.handle('reminders:update', (_e, id, data) => {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ')
    const values = Object.values(data)
    db.prepare(`UPDATE reminders SET ${fields} WHERE id = ?`).run(...values, id)
    return db.prepare('SELECT * FROM reminders WHERE id = ?').get(id)
  })

  ipcMain.handle('reminders:delete', (_e, id) => {
    db.prepare('DELETE FROM reminders WHERE id = ?').run(id)
    return { success: true }
  })

  ipcMain.handle('reminders:complete', (_e, id) => {
    db.prepare('UPDATE reminders SET completed = 1 WHERE id = ?').run(id)
    return db.prepare('SELECT * FROM reminders WHERE id = ?').get(id)
  })
}
