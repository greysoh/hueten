const { contextBridge, ipcRenderer } = require("electron");
let isMaximized = false;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));    
}

module.exports = function() {
    document.getElementById('min-button').addEventListener("click", event => {
        ipcRenderer.send("minimize");
    });

    document.getElementById('max-button').addEventListener("click", event => {
        ipcRenderer.send("maximize");
        isMaximized = true;
    });

    document.getElementById('restore-button').addEventListener("click", event => {
        ipcRenderer.send("unmaximize");
        isMaximized = false;
    });

    document.getElementById('close-button').addEventListener("click", event => {
        ipcRenderer.send("close");
    });

    async function toggleButtons() {
        while (true) {
            if (isMaximized) {
                document.body.classList.add('maximized');
            } else {
                document.body.classList.remove('maximized');
            }

            await sleep(100);
        }
    }

    toggleButtons();
}