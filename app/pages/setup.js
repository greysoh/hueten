const HueAPI = require("../../hue.api");
const hue = new HueAPI("Hueten");
const { contextBridge, ipcRenderer } = require("electron");
let isBridgeURLOverwritten = false;

document.addEventListener("keypress", function(e) {
    if (e.key.toLowerCase() == "e") {
        isBridgeURLOverwritten = true;
    }
})

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = async function() {
    if (localStorage.getItem("bridgeUrl") != null) {
        hue.connection.setBridgeURL(localStorage.getItem("bridgeUrl"));
    } else {
        await localStorage.setItem("bridgeUrl", await hue.connection.getBridgeURL());
    }

    if (isBridgeURLOverwritten) {
        let input = document.createElement("input");
        input.type = "text";
        input.addEventListener("keypress", function(e) {
            if (e.key == "Enter") {
                localStorage.setItem("bridgeUrl", input.value);
                hue.connection.setBridgeURL(localStorage.getItem("bridgeUrl"));
                isBridgeURLOverwritten = false;
            }
        })

        document.getElementsByClassName("text")[0].innerHTML = "";
        document.getElementsByClassName("text")[0].appendChild(input);

        while (isBridgeURLOverwritten) {
            await sleep(100);
        }

        document.getElementsByClassName("text")[0].innerHTML = "";
    }

    document.getElementsByClassName("text")[0].innerText = "Please click the blue Pair button.";
    let user = "";

    if (localStorage.getItem("username") !== null) {
        user = localStorage.getItem("username");
    } else {
        user = await hue.auth.generateUsername();
    }

    document.getElementsByClassName("text")[0].innerText = "Configuring...";
    localStorage.setItem("username", user);

    document.getElementsByClassName("text")[0].innerText = "Restarting...";
    ipcRenderer.send("restart");
}