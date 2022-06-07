const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { join } = require("path");
const log4js = require("log4js");

const logger = log4js.getLogger("UILoader");

if (process.env.LOG_LEVEL) {
  logger.level = process.env.LOG_LEVEL;
}

// We create a window initialization function,
const createWindow = () => {
  // Log that we are creating the window.
  logger.info("Creating window");
  // create the new window,
  const win = new BrowserWindow({
    width: 300,
    height: 600,
    frame: false,
    webPreferences: {
      preload: join(__dirname, "/app/preloader.js")
    },
  });

  // and hide it, while we're loading.
  win.hide();

  // We load the base template,
  win.loadFile(join("./app/main/index.html"));

  // and answer to lots of requests.
  ipcMain.on("setWindowSize", (event, width, height) => {
    win.setSize(width, height);
  });

  ipcMain.on("ready", function () {
    logger.info("Window is ready");
    win.show();
  });
  
  ipcMain.on("failure", (event, title, message, shouldClose) => {
    const failLogger = log4js.getLogger("FailHandler");

    if (process.env.LOG_LEVEL) {
      failLogger.level = process.env.LOG_LEVEL;
    }    

    dialog.showErrorBox(title, message);

    if (shouldClose) {
      failLogger.fatal(message);
      app.quit();
    } else {
      failLogger.error(message);
    }
  })

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

  ipcMain.on("restart", function () {
      app.relaunch();
      app.exit();
  })

  // before the window unloads, we remove all the listeners to avoid some error. 
  win.onBeforeUnload = () => {
      win.removeAllListeners();
  }
};

// When all the windows are closed,
app.on("window-all-closed", () =>{
  // and the platform is not macOS, we quit the app.
  if (process.platform !== "darwin") app.quit();
});

// When the app is ready, we create the window.
app.whenReady().then(() => {
  const app = require("./package.json");

  logger.info("Version " + app.version)
  logger.info("App is starting");

  createWindow();
});
