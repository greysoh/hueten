const fs = require("fs");
const { join } = require("path");
const HueAPI = require("../../hue.api");
const hue = new HueAPI("Hueten");

let newElements = [];

const roomTemplate = fs.readFileSync(join(__dirname, "./templates/room.html"), "utf-8");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = async function() {
    hue.connection.setBridgeURL(localStorage.getItem("bridgeUrl"));
    hue.auth.setUsername(localStorage.getItem("username"));

    while (true) {
        let rooms = await hue.lighting.getGroups();

        let roomList = document.getElementById("rooms");
        let newHTML = "";

        let roomID = 0;

        // 1st Pass - Detect old rooms and apply values changed
        if (document.getElementById("rooms").innerHTML != "") {
            let iterateCount = 0; // Fix to not cause mass chaos - sorry dad
            for (i of roomList.getElementsByClassName("hellopersonreadingthis")) {
                let roomActions = {};

                let id = i.id; // Room ID - Sequential order of array elements
                id = parseInt(id.substring(3)); // Parsed back into int
                let elem = newElements[iterateCount]; 

                // 1st part - Detect brightness stuff
                let brightnessSlider = i.getElementsByClassName("roomSlider")[0]; // Local copy of slider
                let brightnessSliderOld = elem.getElementsByClassName("roomSlider")[0]; // Old copy of slider

                if (brightnessSlider.value != brightnessSliderOld.value) {
                    roomActions.bri = Math.round(parseInt(brightnessSlider.value) * 2.55);
                }

                // 2nd part - Detect toggle switch stuff
                let checkbox = i.getElementsByTagName("input")[1]; // Switch element
                
                // If the current checkbox is different then the old one, 
                if (checkbox.checked != elem.getElementsByTagName("input")[1].checked) {
                    // we toggle it using an API request 
                    roomActions.on = checkbox.checked;
                }

                if (JSON.stringify(roomActions) !== "{}") {
                    await hue.lighting.roomAction(id, roomActions);
                }

                iterateCount++;
            }
        }

        // 2nd Pass - Refresh room list
        rooms = await hue.lighting.getGroups();
        newElements = [];

        for (i in rooms) {
            if (rooms[i].type != "Room") continue;

            let template = roomTemplate;
            
            template = template.replaceAll("{{name}}", rooms[i].name);
            template = template.replaceAll("{{brightness}}", rooms[i].action.bri / 2.55);
            template = template.replaceAll("{{roomID}}", "hi_" + i);
            template = template.replaceAll("{{rawRoomID}}", roomID);

            if (rooms[i].action.on) template = template.replaceAll("{{checked}}", "checked");
            template = template.replaceAll("{{checked}}", "");
            
            template = template.replaceAll("{{weDidTheMonsterMath}}", 70 * roomID + (5 * roomID) + 5);

            newHTML += template;

            let elem = document.createElement("div");
            elem.innerHTML = template;

            newElements.push(elem);
            roomID++;
        }

        roomList.innerHTML = newHTML;

        await sleep(500);
    }
}