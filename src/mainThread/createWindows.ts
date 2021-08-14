import { BrowserView, BrowserWindow, ipcMain } from "electron"
import { join } from "path"
import { isDev } from "../utils/random"


export function createMainWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    webPreferences: {
      devTools: isDev(),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    useContentSize: true,
  })

  // and load the index.html of the app.
  const view = new BrowserView({
    webPreferences: {
      preload: join(__dirname, "../", "renderThread", "/", "preload.js"),
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

  view.webContents.addListener("did-navigate-in-page", (event, url) => {
    view.webContents.send("navigation", url)
  })
}

export function createSettingsWindow() {
  const settingsWindow = new BrowserWindow({
    webPreferences: {
      devTools: isDev(),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: join(
        __dirname,
        "../",
        "renderThread",
        "/",
        "preloadSettings.js"
      ),
    },
    useContentSize: true,
  })

  settingsWindow
    .loadFile(join(__dirname, "..", "static", "settings.html"))
    .then()
    .catch((reason) => console.error(reason))
}
