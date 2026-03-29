import { BrowserWindow, screen } from 'electron'
import { getDb } from './database'

const activeToasts = new Set<BrowserWindow>()

export function initReminderScheduler(win: BrowserWindow) {
  setInterval(() => checkReminders(win), 30000)
  setTimeout(() => checkReminders(win), 3000)
}

function showToast(title: string, body: string, onClick: () => void) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const toastWidth = 340
  const toastHeight = 90
  
  const toastWin = new BrowserWindow({
    width: toastWidth,
    height: toastHeight,
    x: width - toastWidth - 20,
    y: height - toastHeight - 60,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })
  
  activeToasts.add(toastWin)
  toastWin.on('closed', () => activeToasts.delete(toastWin))

  // To make it slide-in, we just rely on CSS animation
  const safeTitle = title.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const safeBody = body.replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          body {
            margin: 0;
            padding: 0;
            background: transparent;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            overflow: hidden;
            height: 100vh;
            user-select: none;
          }
          a {
            display: block;
            text-decoration: none;
            color: inherit;
            padding: 18px 20px;
            background: #ffffff;
            border: 1px solid #e5e5e5;
            border-radius: 12px;
            box-sizing: border-box;
            height: 100%;
            cursor: pointer;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            transition: transform 0.1s;
          }
          a:hover { background: #fafafa; }
          a:active { transform: scale(0.98); }
          .title { font-weight: 600; font-size: 14px; margin-bottom: 4px; color: #000; letter-spacing: -0.2px; }
          .body { font-size: 13px; color: #555; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          
          @media (prefers-color-scheme: dark) {
            a { background: #1a1a1a; border-color: #262626; box-shadow: 0 10px 45px rgba(0,0,0,0.8); }
            a:hover { background: #222; }
            .title { color: #fff; }
            .body { color: #aaa; }
          }
        </style>
      </head>
      <body>
        <a href="https://toast-clicked/">
          <div class="title">${safeTitle}</div>
          <div class="body">${safeBody}</div>
        </a>
      </body>
    </html>
  `

  toastWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)

  const timeout = setTimeout(() => {
    if (!toastWin.isDestroyed()) toastWin.close()
  }, 10000)

  toastWin.webContents.on('will-navigate', (e, url) => {
    if (url === 'https://toast-clicked/') {
      e.preventDefault()
      clearTimeout(timeout)
      if (!toastWin.isDestroyed()) toastWin.close()
      onClick()    
    }
  })
}

function checkReminders(win: BrowserWindow) {
  const db = getDb()
  const now = Date.now()

  const pending = db.prepare(
    'SELECT * FROM reminders WHERE notified = 0 AND completed = 0'
  ).all()

  const due = (pending as any[]).filter(
    r => new Date(r.remind_at).getTime() <= now
  )

  for (const reminder of due) {
    showToast(
      `Reminder: ${reminder.title}`,
      reminder.description || 'Click to open Lekhak',
      () => { win.show(); win.focus() }
    )

    db.prepare('UPDATE reminders SET notified = 1 WHERE id = ?').run(reminder.id)

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

  const pad = (n: number) => String(n).padStart(2, '0')
  const local = `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}T${pad(next.getHours())}:${pad(next.getMinutes())}`
  db.prepare('UPDATE reminders SET remind_at = ?, notified = 0 WHERE id = ?').run(local, reminder.id)
}
