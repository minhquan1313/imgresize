import { IpcRenderer, contextBridge, ipcRenderer } from "electron";
import os from "os";
import path from "path";
import Toastify from "toastify-js";

contextBridge.exposeInMainWorld("os", {
    homedir: () => os.homedir(),
});
contextBridge.exposeInMainWorld("path", {
    join: (...p: string[]) => path.join(...p),
});
contextBridge.exposeInMainWorld("toast", {
    show: (options: Toastify.Options) => Toastify(options).showToast(),
});
contextBridge.exposeInMainWorld("ipcRenderer", {
    send: (channel: string, data: any) => ipcRenderer.send(channel, data),
    on: (channel: string, cb: (data: any) => void) => ipcRenderer.on(channel, (e, data) => cb(data)),
});

declare global {
    const os: {
        homedir: () => string;
    };
    const path: {
        join: (...p: string[]) => string;
    };
    const toast: {
        show: (options: Toastify.Options) => void;
    };
    const ipcRenderer: {
        send: (channel: string, data: any) => void;
        on: (channel: string, cb: (data: any) => void) => void;
    };
}

export {};
