const HueAPI = require("../../hue.api");
const hue = new HueAPI("Hueten");

module.exports = async function() {
    hue.connection.setBridgeURL(localStorage.getItem("bridgeUrl"));
    hue.auth.setUsername(localStorage.getItem("username"));

    //console.log(await hue.lighting.getRooms());
}