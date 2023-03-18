import { app, BrowserWindow, Menu, MenuItemConstructorOptions } from "electron";
import { MenuItem } from "electron/main";
import path from "path";

const templatesDir = {
    main: path.join(__dirname, "templates", "index.html"),
    about: path.join(__dirname, "templates", "about.html"),
};
const isMac = process.platform === "darwin";
const isProduction = process.env.NODE_ENV === "production";

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        title: "Image Resize",
        width: 1000,
        height: 900,
    });

    if (!isProduction) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(templatesDir.main);
}
function createAboutWindow() {
    const mainWindow = new BrowserWindow({
        title: "About Image Resize",
        width: 500,
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
                    click: () => app.quit(),
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

app.on("window-all-closed", () => {
    if (!isMac) app.quit();
});
