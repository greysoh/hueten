const fs = require("fs");
const { join } = require("path");
const HueAPI = require("../../hue.api");
const hue = new HueAPI("Hueten");

const roomTemplate = fs.readFileSync(join(__dirname, "./templates/room.html"), "utf-8");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = async function() {
    hue.connection.setBridgeURL(localStorage.getItem("bridgeUrl"));
    hue.auth.setUsername(localStorage.getItem("username"));

    while (true) {
        let roomID = 0;
        let rooms = await hue.lighting.getRooms();

        let roomList = document.getElementById("rooms");
        let newHTML = "";

        
        for (i of rooms) {
            let template = roomTemplate;
            
            template = template.replaceAll("{{name}}", i.name);
            template = template.replaceAll("{{brightness}}", i.action.bri / 2.55);
            template = template.replaceAll("{{roomID}}", "hi_" + roomID);
            template = template.replaceAll("{{rawRoomID}}", roomID);

            if (i.action.on) template = template.replaceAll("{{checked}}", "checked");
            template = template.replaceAll("{{checked}}", "");
            
            template = template.replaceAll("{{weDidTheMonsterMath}}", 70 * roomID + (5 * roomID) + 5);

            newHTML += template;
            roomID++;
        }

        roomList.innerHTML = newHTML;

        await sleep(1000);
    }
}