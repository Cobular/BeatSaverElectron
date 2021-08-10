import { contextBridge, ipcRenderer } from "electron"

export function generateContextBridge() {
  contextBridge.exposeInMainWorld("ipc", {
    "sendSettings": () => {ipcRenderer.send("updateSettings")}
  });
}





