import { app, BrowserWindow, ipcMain, Menu, MenuItemConstructorOptions } from "electron";
import fs from "fs";
import os from "os";
import path from "path";
import resizeImg from "resize-img";
import { IImageResizeOpts } from "./types/IImageResizeOpts";

const templatesDir = {
    main: path.join(__dirname, "templates", "index.html"),
    about: path.join(__dirname, "templates", "about.html"),
};
const isMac = process.platform === "darwin";
const isDev = process.env.NODE_ENV !== "production";

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        title: "Image Resize",
        width: 900,
        height: 600,

        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js"),
        },
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(templatesDir.main);
}

function createAboutWindow() {
    const mainWindow = new BrowserWindow({
        title: "About Image Resize",
        width: 600,
        height: 500,
    });

    mainWindow.loadFile(templatesDir.about);
}

app.whenReady().then(() => {
    console.log("Starting...");

    createMainWindow();

    const menu: MenuItemConstructorOptions[] = [
        {
            label: "File",
            submenu: [
                {
                    label: "Quit",
                    click: app.quit,
                    accelerator: "CmdOrCtrl+W",
                },
            ],
        },
        ...(isMac
            ? [
                  {
                      label: app.name,
                      submenu: [
                          {
                              label: "About",
                              click: createAboutWindow,
                          },
                      ],
                  },
              ]
            : [
                  {
                      label: "Help",
                      submenu: [
                          {
                              label: "About",
                              click: createAboutWindow,
                          },
                      ],
                  },
              ]),
    ];
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

ipcMain.on("image:resize", (e, opts: IImageResizeOpts) => {
    const _opts = { ...opts, dest: path.join(os.homedir(), "imageresizer") };
    resizeImage(_opts);
});
async function resizeImage({ imgPath, height, width, dest }: Required<IImageResizeOpts>) {
    try {
        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width,
            height,
        });
        const fileName = path.basename(imgPath);

        if (!fs.existsSync(dest)) fs.mkdirSync(dest);

        fs.writeFileSync(path.join(dest, fileName), newPath);
    } catch (error) {
        console.log(error);
    }
}

app.on("window-all-closed", () => {
    if (!isMac) app.quit();
});
