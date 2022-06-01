const { contextBridge, ipcRenderer } = require("electron");
const titlebar = require("./pages/titlebar");

addEventListener("DOMContentLoaded", async function() {
    titlebar();
    ipcRenderer.send("ready");
})