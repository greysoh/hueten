const HueAPI = require("../../hue.api");
const hue = new HueAPI("Hueten");
const { contextBridge, ipcRenderer } = require("electron");
let isBridgeURLOverwritten = false;

const axios = require('axios');

const package = require("../../package.json");
const buildVer = package.version;

async function isAlive(ip) {
    try {
        let data = await axios({
            method: "get",
            url: ip,
            timeout: 20000
        });

        if (data.data == undefined) {
            return false;
        } else {
            return true;
        }
    } catch (e) {
        return false;
    }
}

document.addEventListener("keypress", function(e) {
    if (e.key.toLowerCase() == "e") {
        isBridgeURLOverwritten = true;
    }
})

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = async function() {
    console.log(await isAlive("https://discovery.meethue.com"))
    if (!await isAlive("https://discovery.meethue.com")) {
        ipcRenderer.send("failure", "Fatal", "Could not connect to Discovery service", true);
    }

    // Add the build version to the image attribution
    document.getElementsByClassName("attrib")[0].innerHTML = `v${buildVer} | Alpha | ` + document.getElementsByClassName("attrib")[0].innerHTML; 
    ipcRenderer.send("ready"); // Make the window show up, since we're ready
    
    if (localStorage.getItem("bridgeUrl") != null) { // If we have a bridge URL, we skip this steap
        hue.connection.setBridgeURL(localStorage.getItem("bridgeUrl")); // Set the bridge URL
    } else {
        localStorage.setItem("bridgeUrl", await hue.connection.getBridgeURL()); // Get the bridge url, then set it
    }

    document.getElementsByClassName("text")[0].innerText = "Waiting for 'e' key to be pressed (if needed)."; // Set the text to the waiting for keypress text

    if (isBridgeURLOverwritten) document.getElementsByClassName("text")[0].innerText = "Please wait..." // If the key was pressed before this, we show a please wait

    await sleep(1000); // Wait a second

    if (isBridgeURLOverwritten) {
        // If e was pressed, we create an input element,
        let input = document.createElement("input");
        input.type = "text";

        // and a span element,
        let span = document.createElement("span");
        span.innerText = "Bridge URL: ";

        // add an event listener to the input element,
        input.addEventListener("keypress", function(e) {
            // and if the key is enter,
            if (e.key == "Enter") {
                // we set the bridge URL to the input value, and reset the var.
                localStorage.setItem("bridgeUrl", input.value);
                hue.connection.setBridgeURL(localStorage.getItem("bridgeUrl"));
                isBridgeURLOverwritten = false;
            }
        })

        // We add the input and span element to the body,
        document.getElementsByClassName("text")[0].innerHTML = "";
        document.getElementsByClassName("text")[0].appendChild(span);
        document.getElementsByClassName("text")[0].appendChild(input);

        // and wait for the variable to be unset (triggers when user presses enter in the element)
        while (isBridgeURLOverwritten) {
            await sleep(100);
        }

        // We remove the input element from the body,
        document.getElementsByClassName("text")[0].innerHTML = "";
    }

    // And we wait for the user to click the input button.
    document.getElementsByClassName("text")[0].innerText = "Please click the blue Pair button.";
    let user = "";

    // If it is already set, we skip this part.
    if (localStorage.getItem("username") !== null) {
        user = localStorage.getItem("username");
    } else { // Else, we generate a username
        user = await hue.auth.generateUsername();
    }

    // We set the username in the local storage,
    document.getElementsByClassName("text")[0].innerText = "Configuring...";
    localStorage.setItem("username", user);

    // and restart the app.
    document.getElementsByClassName("text")[0].innerText = "Restarting...";
    ipcRenderer.send("restart");
}