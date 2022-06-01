const { contextBridge, ipcRenderer } = require("electron");
const titlebar = require("./main/titlebar");

const conf = require("../conf.api");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadPage(page) {
    const path = require("path");
    const fs = require("fs");

    const pagePath = path.join(__dirname, "pages/", page || "index.html");
    const file = fs.readFileSync(pagePath);

    document.getElementById("main").innerHTML = file;

    for (i of document.getElementById("main").getElementsByTagName("title")) {
        document.title = i.innerHTML;
    }

    for (i of document.getElementById("main").getElementsByTagName("script")) {
        if (i.src) continue;

        eval(i.innerHTML);
    }
}

async function refreshTitled() {
    while (true) {
        document.getElementById("window-title").getElementsByTagName("span")[0].innerText = document.title;
        await sleep(100);
    }
}

addEventListener("DOMContentLoaded", async function() {
    titlebar();
    refreshTitled();
    document.title = "Hueten Setup";

    await conf.init(true);

    if (await conf.db.get("username") == null) {
        ipcRenderer.send("setWindowSize", 1200, 720)
    }

    await loadPage("index.html");
    
    ipcRenderer.send("ready");
})