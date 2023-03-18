import { app, BrowserWindow } from "electron";
import path from "path";

const templatesDir = {
    main: path.join(__dirname, "templates", "index.html"),
};
const isMac = process.platform === "darwin";
const isProduction = process.env.NODE_ENV === "production";

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        title: "Image Resize",
        width: 1200,
        height: 900,
    });

    if (!isProduction) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(templatesDir.main);
}

app.whenReady().then(() => {
    console.log("Starting...");

    createMainWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

app.on("window-all-closed", () => {
    if (!isMac) app.quit();
});
