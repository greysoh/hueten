const { contextBridge, ipcRenderer } = require("electron");
const titlebar = require("./pages/titlebar");

const conf = require("../conf.api");

addEventListener("DOMContentLoaded", async function() {
    titlebar();
    await conf.init();

    if (await conf.db.get("username") == null) {
        ipcRenderer.send("setWindowSize", 1200, 720)
    }
    
    ipcRenderer.send("ready");
})