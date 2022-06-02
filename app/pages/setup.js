const HueAPI = require("../../hue.api");
const hue = new HueAPI("Hueten");
const { contextBridge, ipcRenderer } = require("electron");

module.exports = async function() {
    if (localStorage.getItem("bridgeUrl") != null) {
        hue.connection.setBridgeURL(localStorage.getItem("bridgeUrl"));
    } else {
        await localStorage.setItem("bridgeUrl", await hue.connection.getBridgeURL());
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