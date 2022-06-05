module.exports = async function(reloadHTMLJS, addControlButton) {
    document.getElementById("refreshInput").value = parseInt(localStorage.getItem("timeWait")) / 1000;  // Set the input to the waiting time in seconds

    addControlButton("settingsButton", "assets/settings.png", function() { // Add the setttings button, which reloads to the main page on click
        window.location.reload();
    })

    document.getElementById("refreshInput").addEventListener("change", function(e) { // When the input changes, set the waiting time
        let value = parseFloat(e.target.value); // Get the value of input as a float
        if (isNaN(value)) return; // If the value is not a number (or in this case, float), return

        localStorage.setItem("timeWait", Math.round(value * 1000)); // Set the waiting time in milliseconds
    })
}