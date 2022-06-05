module.exports = async function(reloadHTMLJS, addControlButton) {
    document.getElementById("refreshInput").value = parseInt(localStorage.getItem("timeWait")) / 1000;

    addControlButton("settingsButton", "assets/settings.png", function() {
        window.location.reload();
    })

    document.getElementById("refreshInput").addEventListener("change", function(e) {
        let value = parseFloat(e.target.value);
        if (isNaN(value)) return;

        localStorage.setItem("timeWait", Math.round(value * 1000));
    })
}