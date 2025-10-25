import { initialize, enable } from "@electron/remote/main/index.js";
import { BrowserWindow, Menu, app } from "electron";
import { fileURLToPath } from "url";
import path from "path";

let mainWindow: BrowserWindow | undefined;

const currentDir = fileURLToPath(new URL(".", import.meta.url));

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.resolve(
        currentDir,
        path.join(
          process.env.QUASAR_ELECTRON_PRELOAD_FOLDER,
          `electron-preload${process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION}`,
        ),
      ),
      devTools: false,
      sandbox: false,
    },
    icon: path.resolve(currentDir, "icons/icon.png"),
    show: false,
    width: 1000,
  });
  enable(mainWindow.webContents);
  if (process.env.DEV) await mainWindow.loadURL(process.env.APP_URL);
  else await mainWindow.loadFile("index.html");
  mainWindow.on("closed", () => {
    mainWindow = undefined;
  });
  mainWindow.show();
  // mainWindow.webContents.openDevTools();
};

initialize();
Menu.setApplicationMenu(null);
void app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (mainWindow === undefined) void createWindow();
});
