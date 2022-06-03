const { contextBridge, ipcRenderer } = require("electron");
const titlebar = require("./main/titlebar");
const setup = require("./pages/setup.js");
const mainui = require("./pages/mainui.js");

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

contextBridge.exposeInMainWorld("loadHTML", loadPage);

async function refreshTitled() {
    while (true) {
        document.getElementById("window-title").getElementsByTagName("span")[0].innerText = document.title;
        await sleep(100);
    }
}

addEventListener("DOMContentLoaded", async function() {
    titlebar();
    refreshTitled();

    if (localStorage.getItem("bridgeUrl") == null || localStorage.getItem("username") == null) {
        document.title = "Hueten Setup";
        ipcRenderer.send("setWindowSize", 1200, 720);
        await loadPage("setup.html");

        try {
            setup();
        } catch(e) {
            alert("Setup failed.");
        }
    } else {
        await loadPage("mainui.html");

        try {
            mainui();
        } catch (e) {
            alert("MainUI Failed");
        }
    }
})