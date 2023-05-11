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
    send: ipcRenderer.send,
    on: ipcRenderer.on,
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
        send: IpcRenderer["send"];
        on: IpcRenderer["on"];
    };
}

export {};
