import { app, BrowserView, BrowserWindow } from "electron"
import * as path from "path"
import { getAllHashes } from "./hashes.js"


function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    useContentSize: true
  })

  // and load the index.html of the app.
  const view = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow()

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here
getAllHashes("C:\\Users\\jdc10\\Downloads\\BSLegacyUtil (1)\\BSLegacyUtil\\Beat Saber\\Beat Saber_Data\\CustomLevels")

const { ipcMain } = require('electron')
ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  event.reply('asynchronous-reply', 'pong')
})

ipcMain.on('synchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  event.returnValue = 'pong'
})
