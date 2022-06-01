const { app, BrowserWindow } = require("electron");
const { join } = require("path");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        preload: join(__dirname, "/app/preloader.js")
    }
  });

  win.loadFile(join(__dirname + "./app/pages/index.html"));
};

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.whenReady().then(() => {
  createWindow();
});
