import { BrowserWindow } from 'electron'
import { exec } from 'child_process'
import { getDb } from './database'

export function initReminderScheduler(win: BrowserWindow) {
  setInterval(() => checkReminders(win), 30000)
  setTimeout(() => checkReminders(win), 3000)
}

function showToast(title: string, body: string, onClick: () => void) {
  // Use PowerShell Windows Runtime toast — works reliably in dev and prod
  const safeTitle = title.replace(/'/g, '').replace(/"/g, '')
  const safeBody = body.replace(/'/g, '').replace(/"/g, '')

  const script = `
    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    $asTask = [System.WindowsRuntimeSystemExtensions].GetMethod('AsTask', [System.Type[]]@([Windows.Foundation.IAsyncOperation\`1].MakeGenericType([Windows.UI.Notifications.UserNotificationListener])))
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
    $template = @"
<toast>
  <visual>
    <binding template='ToastGeneric'>
      <text>${safeTitle}</text>
      <text>${safeBody}</text>
    </binding>
  </visual>
</toast>
"@
    $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
    $xml.LoadXml($template)
    $toast = New-Object Windows.UI.Notifications.ToastNotification($xml)
    $notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Lekhak')
    $notifier.Show($toast)
  `.trim()

  exec(`powershell -NoProfile -NonInteractive -Command "${script.replace(/\n/g, ' ')}"`, (err) => {
    if (err) {
      // Fallback: simpler balloon via msg command
      exec(`msg %username% /time:10 "${safeTitle}: ${safeBody}"`)
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
