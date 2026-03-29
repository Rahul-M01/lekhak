import { BrowserWindow, Notification } from 'electron'
import { getDb } from './database'

export function initReminderScheduler(win: BrowserWindow) {
  setInterval(() => {
    checkReminders(win)
  }, 30000) // check every 30 seconds

  // Also check on startup
  setTimeout(() => checkReminders(win), 3000)
}

function checkReminders(win: BrowserWindow) {
  const db = getDb()
  const now = new Date().toISOString()

  const dueReminders = db.prepare(`
    SELECT * FROM reminders
    WHERE remind_at <= ? AND notified = 0 AND completed = 0
  `).all(now)

  for (const reminder of dueReminders as any[]) {
    // Show Windows notification
    const notif = new Notification({
      title: `Reminder: ${reminder.title}`,
      body: reminder.description || 'Tap to open Lekhak',
      silent: false
    })

    notif.on('click', () => {
      win.show()
      win.focus()
    })

    notif.show()

    // Mark as notified
    db.prepare('UPDATE reminders SET notified = 1 WHERE id = ?').run(reminder.id)

    // Handle repeat
    if (reminder.repeat !== 'none') {
      scheduleRepeat(db, reminder)
    }
  }
}

function scheduleRepeat(db: any, reminder: any) {
  const base = new Date(reminder.remind_at)
  let next: Date

  switch (reminder.repeat) {
    case 'daily':
      next = new Date(base.getTime() + 24 * 60 * 60 * 1000)
      break
    case 'weekly':
      next = new Date(base.getTime() + 7 * 24 * 60 * 60 * 1000)
      break
    case 'monthly':
      next = new Date(base)
      next.setMonth(next.getMonth() + 1)
      break
    default:
      return
  }

  db.prepare('UPDATE reminders SET remind_at = ?, notified = 0 WHERE id = ?')
    .run(next.toISOString(), reminder.id)
}
