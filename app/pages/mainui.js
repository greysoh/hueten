const fs = require("fs");
const { join } = require("path");
const HueAPI = require("../../hue.api");
const hue = new HueAPI("Hueten");

const colorConverter = require("cie-rgb-color-converter");

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

                if (brightnessSlider.value != brightnessSliderOld.value) { // If the brightness slier is modified,
                    roomActions.bri = Math.round(parseInt(brightnessSlider.value) * 2.55); // we set the brightness to the slider value * 2.55
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

        let lights = await hue.lighting.getLights();

        for (i in rooms) {
            if (rooms[i].type != "Room") continue;

            let template = roomTemplate;
            
            // Filling in template
            template = template.replaceAll("{{name}}", rooms[i].name);
            template = template.replaceAll("{{brightness}}", rooms[i].action.bri / 2.55);
            template = template.replaceAll("{{roomID}}", "hi_" + i);
            template = template.replaceAll("{{rawRoomID}}", roomID);

            if (rooms[i].action.on) template = template.replaceAll("{{checked}}", "checked"); // If the room is on, we check the checkbox
            template = template.replaceAll("{{checked}}", ""); // else, we uncheck it
            
            template = template.replaceAll("{{weDidTheMonsterMath}}", 70 * roomID + (5 * roomID) + 5); // Some math that CSS was too stupid to do

            // Calculate light gradient
            if (rooms[i].lights.length == 1) { // If there is only 1 light in the room,
                if (rooms[i].action.xy != undefined) { // and the room has a color,
                    // we calculate the actual color,
                    let rgb = colorConverter.xyBriToRgb(rooms[i].action.xy[0], rooms[i].action.xy[1], rooms[i].action.bri);

                    // and set the color.
                    template = template.replaceAll("{{backgroundColor}}", "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")");
                } else { // and the room doesn't have a color,
                    // we set the color to white,
                    let rgb = colorConverter.xyBriToRgb(0.35, 0.35, rooms[i].action.bri);

                    // and set the color.
                    template = template.replaceAll("{{backgroundColor}}", "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")");
                }
            } else { // If there is more than 1 light in the room,
                let linearStr = "linear-gradient(90deg,"; // we create a gradient,

                for (j of rooms[i].lights) { // get all the lights in the room,
                    const lightInfo = await hue.lighting.lightSearch(lights, j); // search for the light,

                    if (lightInfo.state.xy != undefined) { // and if it has color,
                        // we calculate the actual color,
                        const rgb = colorConverter.xyBriToRgb(lightInfo.state.xy[0], lightInfo.state.xy[1], lightInfo.state.bri);
    
                        // and push it to the gradient.
                        linearStr += "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + "),";
                    } else { // And if it doesn't have color,
                        // we set the color to white,
                        let rgb = colorConverter.xyBriToRgb(0.35, 0.35, lightInfo.state.bri);
    
                        // and push it to the gradient.
                        linearStr += "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + "),";
                    }
                }

                linearStr = linearStr.substring(0, linearStr.length - 1); // We remove the last comma,
                linearStr += ")"; // and close the gradient.

                // Then, we set the background color.
                template = template.replaceAll("{{backgroundColor}}", linearStr);
            }

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