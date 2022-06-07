const { contextBridge, ipcRenderer } = require("electron");
const log4js = require("log4js"); 

const titlebar = require("./main/titlebar");
const setup = require("./pages/setup.js");
const mainui = require("./pages/mainui.js");

const logger = log4js.getLogger("ElectronUILoader");

if (process.env.LOG_LEVEL) {
    logger.level = process.env.LOG_LEVEL;
}

/**
 * Loads a page
 * @param {string} page Page path (in app/pages/)
 */
function loadPage(page) {
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

/**
 * Reloads and loads page specified
 * @param {string} htmlPath Page path (in app/pages/)
 * @param {string} jsPath JavaScript path (in app/pages/)
 */
function reloadHTMLJS(htmlPath, jsPath) {
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
function addTitlebarButton(buttonID, buttonPic, buttonFunction) {
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

// When the DOM loads,
addEventListener("DOMContentLoaded", async function() {
    // we load the titlebar JS,
    titlebar();
    logger.info("Titlebar loaded");

    // check if the application is set up,
    if (localStorage.getItem("bridgeUrl") == null || localStorage.getItem("username") == null) {
        logger.debug("Application not set up, loading setup UI");

        // and if it isn't, we load the setup page.
        document.title = "Hueten Setup";
        // Including setting the window size to about 720p.
        ipcRenderer.send("setWindowSize", 1200, 720);
        loadPage("setup.html");

        // We also load the setup JS.
        try {
            setup(reloadHTMLJS, addTitlebarButton);
        } catch(e) {
            ipcRenderer.send("failure", "Fatal", "Failed to load setup screen", true);
        }
    } else if (localStorage.getItem("TEMP_htmlPath") != null) { // and if it is, we check if we need to load custom HTML and JS
        logger.debug("Loading custom HTML and JS");
        // If we do, we set the title to be Hueten.
        document.title = "Hueten";
        
        // We load the page specified in localStorage, 
        loadPage(localStorage.getItem("TEMP_htmlPath"));
        // and save the JS function into a variable.
        const js = require(localStorage.getItem("TEMP_jsPath"));

        // We remove those items, 
        localStorage.removeItem("TEMP_htmlPath");
        localStorage.removeItem("TEMP_jsPath");

        // and call the JS function.
        js(reloadHTMLJS, addTitlebarButton);
    } else { // else, we load the Main UI.
        logger.debug("Just a normal load :)");
        // We set the page to be the Main UI,
        loadPage("mainui.html");

        // and load the main UI JS.
        try {
            mainui(reloadHTMLJS, addTitlebarButton);
        } catch (e) {
            ipcRenderer.send("failure", "Fatal", "Failed to load the user interface", true);
        }
    }
})