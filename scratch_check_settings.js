const { getSettings } = require("./lib/settings");

async function check() {
    const settings = getSettings();
    console.log("Current Bot Settings:", JSON.stringify(settings, null, 2));
}

check();
