import { app, BrowserWindow, ipcMain } from "electron"
import { join, parse } from "path"
import { getAllHashes } from "../utils/hashes.js"
import Store from "electron-store"
import { StoreInterface } from "../utils/types"
import { createMainWindow, createSettingsWindow } from "./createWindows"

const store: Store<StoreInterface> = new Store()
if (store.get("firstTime") !== true)
{
  store.set('filePath', "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Beat Saber\\Beat Saber_Data\\CustomLevels")
  store.set('firstTime', false)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createMainWindow()

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
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


// IPC Handlers

// Get song hashes
ipcMain.on("songHashes", (event, arg) => {
  getAllHashes(
    store.get('filePath')
  ).then((value) => {
    event.reply("songHashes", value)
  })
})

// Update settings
ipcMain.on("updateSettings", (event, arg) => {
  try {
    const exePath = parse(arg['file'])
    const songPath = join(exePath.dir, '/', 'Beat Saber_Data', '/', 'CustomLevels')
    store.set("filePath", songPath)
    event.reply("updateSettings-reply", "success")
  }
  catch (e) {
    event.reply("updateSettings-reply", "failure")
  }
})

ipcMain.on("openSettings", async (event, args) => {
  await createSettingsWindow()
})
