import {writable} from "svelte/store"
import pkg from 'electron';
const { ipcRenderer } = pkg;

export const settings = writable({
    file: ""
})

settings.subscribe(
    (settings) => {
        ipcRenderer.send("updateSettings", settings)
    }
)