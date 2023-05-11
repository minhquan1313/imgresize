import { contextBridge } from "electron";
import os from "os";
import path from "path";

contextBridge.exposeInMainWorld("os", {
    homedir: () => os.homedir(),
});
contextBridge.exposeInMainWorld("path", {
    join: (...p: string[]) => path.join(...p),
});
