// Plugin loader — scans /plugins for extra command bundles and registers them
// into the shared commands Map as a fallback / extension layer.
const fs = require("fs");
const path = require("path");

const pluginsDir = path.join(__dirname);

/**
 * @param {Map} commands - The shared commands map from commandHandler
 */
function loadPlugins(commands) {
    if (!fs.existsSync(pluginsDir)) return;

    const files = fs.readdirSync(pluginsDir).filter(
        (f) => f.endsWith(".js") && f !== "pluginLoader.js"
    );

    for (const file of files) {
        try {
            const plugin = require(path.join(pluginsDir, file));

            // A plugin can export a single command object OR an array of them
            const entries = Array.isArray(plugin) ? plugin : [plugin];

            for (const cmd of entries) {
                if (!cmd.name || !cmd.execute) {
                    console.warn(`⚠️  Plugin ${file}: skipping entry — missing name or execute`);
                    continue;
                }
                commands.set(cmd.name.toLowerCase(), cmd);
                console.log(`⚡ Plugin registered command: ${cmd.name}`);
            }
        } catch (err) {
            console.error(`⚠️  Failed to load plugin ${file}:`, err.message);
        }
    }

    console.log(`⚡ Plugin loader done — ${commands.size} total command(s) available`);
}

module.exports = { loadPlugins };