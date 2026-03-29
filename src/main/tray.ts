import { Tray, Menu, BrowserWindow, nativeImage, app } from 'electron'
import path from 'path'

export function initTray(mainWindow: BrowserWindow): Tray {
  // Use a simple colored icon
  const icon = nativeImage.createEmpty()
  const tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Lekhak',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setToolTip('Lekhak — Productivity App')
  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  return tray
}
