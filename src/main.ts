import { app, BrowserWindow, ipcMain, Menu, MenuItemConstructorOptions, shell } from "electron";
import fs from "fs";
import os from "os";
import path from "path";
import resizeImg from "resize-img";
import { IImageResizeOpts } from "./types/IImageResizeOpts";

const templatesDir = {
    main: path.join(__dirname, "templates", "index.html"),
    about: path.join(__dirname, "templates", "about.html"),
};

// process.env.NODE_ENV = "production";
const isMac = process.platform === "darwin";
const isDev = process.env.NODE_ENV !== "production";
let mainWindow: BrowserWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: "Image Resize",
        width: isDev ? 1000 : 500,
        // height: 700,
        minHeight: 700,
        minWidth: 500,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js"),
        },
    });

    if (isDev) {
        console.log("dev");

        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(templatesDir.main);
}

function createAboutWindow() {
    const aboutWindow = new BrowserWindow({
        title: "About Image Resize",
        width: 600,
        height: 500,
    });

    aboutWindow.loadFile(templatesDir.about);
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

    mainWindow.on("close", (r) => {
        (mainWindow as any) = null;
    });

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

ipcMain.on("image:resize", (e, opts: IImageResizeOpts) => {
    console.log("calling image:resize");

    const _opts = { ...opts, dest: path.join(os.homedir(), "imageresizer") };
    console.log(_opts);

    resizeImage(_opts);
});

async function resizeImage({ imgPath, height, width, dest }: Required<IImageResizeOpts>) {
    try {
        console.log("resizeImage");

        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width,
            height,
        });

        const fileName = path.basename(imgPath);
        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
        fs.writeFileSync(path.join(dest, fileName), newPath);

        shell.openPath(dest);

        mainWindow.webContents.send("image:done");
    } catch (error) {
        console.log(error);
    }
}

app.on("window-all-closed", () => {
    if (!isMac) app.quit();
});
