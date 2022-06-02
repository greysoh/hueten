// Migrating to localStorage

module.exports = {
    async init(readOnly) {
        if (localStorage == undefined) {
            throw("Must be called in Electron!");
        }
    },

    db: {
        get(key) {
            if (key == "username") return null; 
            return localStorage.getItem(key);
        },
    
        set(key, value) {
            return localStorage.setItem(key, value);
        }
    }
}