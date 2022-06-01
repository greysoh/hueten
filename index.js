const { app, BrowserWindow, ipcMain } = require("electron");
const { join } = require("path");
const conf = require("./conf.api");

const createWindow = () => {
  let windowConfig = {
    width: 300,
    height: 600,
    frame: false,
    webPreferences: {
      preload: join(__dirname, "/app/preloader.js")
    },
  }
  const win = new BrowserWindow(windowConfig);

  win.hide();

  win.loadFile(join(__dirname + "./app/pages/index.html"));

  ipcMain.on("ready", function () {
    win.show();
  });

  ipcMain.on("minimize", function () {
    win.minimize();
  });

  ipcMain.on("maximize", function () {
    win.maximize();
  });

  ipcMain.on("unmaximize", function () {
    win.unmaximize();
  });

  ipcMain.on("close", function () {
    win.close();
  });

  win.onBeforeUnload = () => {
      win.removeAllListeners();
  }
};

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.whenReady().then(() => {
  createWindow();
});
