import { app, shell, BrowserWindow, ipcMain, Tray, Menu, nativeImage, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { setupIPC } from './ipc'
import { PlanService } from './services/PlanService'
import { TaskService } from './services/TaskService'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuiting = false

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 380,
    height: 700,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    alwaysOnTop: false,
    skipTaskbar: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize
  mainWindow.setBounds({
    x: width - 400, // Margin from right
    y: 100,
    width: 380,
    height: height - 200
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('close', (event) => {
    if (!isQuiting) {
      event.preventDefault()
      mainWindow?.hide()
    }
    return false
  })
}

function createTray() {
  // Try to find icon
  const iconPath = app.isPackaged 
    ? join(process.resourcesPath, '便签软件图标设计.png')
    : join(app.getAppPath(), '便签软件图标设计.png')
    
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 20, height: 20 })
  
  tray = new Tray(trayIcon)
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => mainWindow?.show() },
    { label: 'Quit', click: () => {
      isQuiting = true
      app.quit()
    }}
  ])
  tray.setToolTip('Smartnotes')
  tray.setContextMenu(contextMenu)
  
  tray.on('click', () => {
    mainWindow?.show()
  })
}

function setupWindowIPC() {
  ipcMain.handle('window:setIgnoreMouseEvents', (_, ignore) => {
    if (mainWindow) {
      mainWindow.setIgnoreMouseEvents(ignore, { forward: true })
    }
  })

  ipcMain.handle('window:minimizeToTray', () => {
    mainWindow?.hide()
  })
  
  ipcMain.handle('window:setOpacity', (_, opacity) => {
    mainWindow?.setOpacity(opacity)
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.smartnotes.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  setupIPC()
  setupWindowIPC()
  createWindow()
  createTray()
  
  // Check plans periodically
  setInterval(() => {
    PlanService.checkAndMovePlans()
    TaskService.checkAndCreateRecurringTasks()
  }, 60 * 1000)

  // Initial check
  PlanService.checkAndMovePlans()
  TaskService.checkAndCreateRecurringTasks()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Keep running
  }
})
