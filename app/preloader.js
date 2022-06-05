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

async function reloadHTMLJS(htmlPath, jsPath) {
    localStorage.setItem("TEMP_jsPath", "./pages/" + jsPath);
    localStorage.setItem("TEMP_htmlPath", htmlPath);
    window.location.reload();
}

/**
 * Adds button to navigation buttons on titlebar
 * @param {number} buttonID ID of the button
 * @param {string} buttonPic Picture URL of the button
 * @param {function} buttonFunction Function to be called when the button is clicked
 */
async function addTitlebarButton(buttonID, buttonPic, buttonFunction) {
    // Create button element
    let button = document.createElement("div");
    button.className = "button";
    button.id = buttonID;
    
    // Create image
    let buttonImage = document.createElement("img");
    buttonImage.src = buttonPic;
    buttonImage.className = "icon";

    // Add image
    button.appendChild(buttonImage);
    
    // Function on click
    button.onclick = () => {
        buttonFunction();
    }

    // Add button to titlebar
    document.getElementById("window-controls").insertBefore(button, document.getElementById("window-controls").getElementsByClassName("div")[0]);
}

contextBridge.exposeInMainWorld("loadHTML", loadPage);
contextBridge.exposeInMainWorld("reloadHTMLJS", reloadHTMLJS);

addEventListener("DOMContentLoaded", async function() {
    titlebar();

    if (localStorage.getItem("bridgeUrl") == null || localStorage.getItem("username") == null) {
        document.title = "Hueten Setup";
        ipcRenderer.send("setWindowSize", 1200, 720);
        await loadPage("setup.html");

        try {
            setup(reloadHTMLJS, addTitlebarButton);
        } catch(e) {
            ipcRenderer.send("ready");
            alert("Setup failed.");
        }
    } else if (localStorage.getItem("TEMP_htmlPath") != null) {
        document.title = "Hueten";
        
        await loadPage(localStorage.getItem("TEMP_htmlPath"));
        
        const js = require(localStorage.getItem("TEMP_jsPath"));

        localStorage.removeItem("TEMP_htmlPath");
        localStorage.removeItem("TEMP_jsPath");

        js(reloadHTMLJS, addTitlebarButton);
    } else {
        await loadPage("mainui.html");

        try {
            mainui(reloadHTMLJS, addTitlebarButton);
        } catch (e) {
            ipcRenderer.send("ready");
            alert("MainUI Failed");
        }
    }
})