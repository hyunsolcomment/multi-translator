import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('electron', {
    send(ev: string, args: any) {
        ipcRenderer.send(ev, args);
    },

    receive(ev: string, listener: (args:any) => void) {
        ipcRenderer.on(ev, listener);
    }
})