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
        async setBridgeURL(url) {
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
}