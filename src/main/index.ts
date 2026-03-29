import { app, BrowserWindow, ipcMain, Notification, nativeImage, Tray, Menu, shell } from 'electron'
import path from 'path'
import { initDatabase } from './database'
import { registerIpcHandlers } from './ipc'
import { initTray } from './tray'
import { initReminderScheduler } from './reminders'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0a0a0a',
      symbolColor: '#ffffff',
      height: 38
    },
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#0a0a0a',
    show: false
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('close', (e) => {
    e.preventDefault()
    mainWindow?.hide()
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  return mainWindow
}

app.setAppUserModelId('com.lekhak.app')

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (!mainWindow.isVisible()) mainWindow.show()
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    initDatabase()
    const win = createWindow()
    tray = initTray(win)
    registerIpcHandlers()
    initReminderScheduler(win)

    ipcMain.on('window-minimize', () => mainWindow?.minimize())
    ipcMain.on('window-maximize', () => {
      if (mainWindow?.isMaximized()) mainWindow.unmaximize()
      else mainWindow?.maximize()
    })
    ipcMain.on('window-close', () => mainWindow?.hide())
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Don't quit - stay in tray
  }
})

app.on('before-quit', () => {
  if (mainWindow) {
    mainWindow.removeAllListeners('close')
  }
})
