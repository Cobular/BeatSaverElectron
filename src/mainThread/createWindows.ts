import { BrowserView, BrowserWindow } from "electron"
import serve from "electron-serve"
import { join } from "path"

export function createMainWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    useContentSize: true,
  })

  // and load the index.html of the app.
  const view = new BrowserView({
    webPreferences: {
      preload: join(__dirname, "/", "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  })
  mainWindow.setBrowserView(view)
  view.setBounds({ x: 0, y: 0, width: 800, height: 600 })
  view.setAutoResize({ width: true, height: true })
  view.webContents.loadURL("https://beatsaver.com/")
  view.webContents.openDevTools()
}

const loadURL = serve({directory: 'dist/svelte'});

export async function createSettingsWindow() {
  const settingsWindow = new BrowserWindow({
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: join(__dirname, "preload.js")
    },
  })



  await loadURL(settingsWindow)
}

