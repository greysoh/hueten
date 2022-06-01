const Database = require("@creamy-dev/1udb");
const homedir = require('os').homedir();
const { join } = require("path");

module.exports = {
    async init() {
        this.db = new Database(join(homedir, "hue.db"));
        await this.db.serialize();
    }
}