const axios = require("axios");
let This = {}; // Hack to globalize "this"

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = class HueAPI {
    /**
     * Initializes the Hue API
     * @param {string} deviceType Device type you want to appear as
     */
    constructor(deviceType) {
        This.deviceType = deviceType;
        This.bridge = null;
        This.username = null;
    }

    /**
     * Returns contents of "this". 
     * @returns {object} This
     */
    This() {
        return This;
    }

    /**
     * Connection settings
     */
    connection = {
        /**
         * Gets the bridge URL, then sets it.
         * @returns {string} URL of the bridge
         */
        async getBridgeURL() {
            if (This.bridge) {
                return This.bridge;
            }
    
            const bridge = await axios.get("https://discovery.meethue.com");
            This.bridge = "http://" + bridge.data[0].internalipaddress;
    
            return This.bridge;
        },

        /**
         * Sets the bridge URL
         * @param {string} url URL of the bridge
        */
        setBridgeURL(url) {
            This.bridge = url;
        }
    }

    /**
     * Authentication settings
     */
    auth = {
        /**
         * Generates a username for the bridge
         * @returns {string} Username for the bridge
         * @throws {Error} If the bridge is not connected
        */
        async generateUsername() {
            if (!This.bridge) throw("No bridge defined, please run connection.getBridgeURL() or connection.setBridgeURL(url) first");
            const httpUrl = This.bridge;
            const deviceType = This.deviceType;

            while (true) {
                try {
                    const bridge = await axios.post(httpUrl + "/api", {
                        "devicetype": deviceType || "hueapi-nodejs"
                    });
        
                    if (bridge.data[0].error) {
                        throw(bridge.data[0].error.description);
                    }
        
                    if (bridge.data[0].success.username) {
                        This.username = bridge.data[0].success.username;
                        return bridge.data[0].success.username;
                    }
                } catch (error) {
                    await sleep(1000);
                }
            }
        },

        /**
         * Sets the username for the bridge
         * @param {string} username Username for the bridge
         */
        async setUsername(username) {
            This.username = username;
        }
    }

    /**
     * Basic lighting
     */
    lighting = {
        async getGroups() {
            if (!This.bridge) throw("No bridge defined, please run connection.getBridgeURL() or connection.setBridgeURL(url) first");
            if (!This.username) throw("No username defined, please run auth.generateUsername() or auth.setUsername(name) first");

            let data = await axios.get(This.bridge + "/api/" + This.username + "/groups");
            let newData = {};

            for (let i in data.data) {
                newData[i] = data.data[i];
                newData[i].id = i;
            }

            return newData;
        },

        async getRooms() {
            const data = await this.getGroups();
            let arr = [];

            for (let i in data) {
                if (data[i].type == "Room") arr.push(data[i]);
            }

            return arr;
        },

        /**
         * Runs room actions specified
         * @param {number} roomID ID of room
         * @param {JSON} action action body 
         */
        async roomAction(roomID, action) {
            if (!This.bridge) throw("No bridge defined, please run connection.getBridgeURL() or connection.setBridgeURL(url) first");
            if (!This.username) throw("No username defined, please run auth.generateUsername() or auth.setUsername(name) first");

            await axios.put(This.bridge + "/api/" + This.username + "/groups/" + roomID + "/action", action);
        }
    }
}