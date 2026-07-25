module.exports = {
    name: "closetime",
    description: "Schedule the group to close after a specific duration (e.g. 10m, 2h)",
    category: "group",
    isAdminOnly: true,
    isGroupOnly: true,
    execute: async (ctx) => {
        const { sock, jid, args, msg } = ctx;

        if (!args[0]) {
            return await sock.sendMessage(jid, { 
                text: "⚠️ *Usage:* `.closetime <duration>`\n\n*Examples:*\n▸ `.closetime 30s` (30 seconds)\n▸ `.closetime 15m` (15 minutes)\n▸ `.closetime 2h` (2 hours)" 
            }, { quoted: msg });
        }

        const parseDuration = (str) => {
            const num = parseInt(str);
            if (isNaN(num)) return null;
            const unit = str.replace(/[0-9]/g, '').trim().toLowerCase();
            if (unit === 's' || unit === 'sec' || unit === 'secs') return num * 1000;
            if (unit === 'm' || unit === 'min' || unit === 'mins') return num * 60 * 1000;
            if (unit === 'h' || unit === 'hr' || unit === 'hrs') return num * 60 * 60 * 1000;
            return num * 60 * 1000; // Default to minutes
        };

        const durationMs = parseDuration(args[0]);
        if (!durationMs || durationMs <= 0) {
            return await sock.sendMessage(jid, { text: "⚠️ Invalid duration format. Please use format like `10m` or `2h`." }, { quoted: msg });
        }

        global.groupTimers = global.groupTimers || {};
        if (global.groupTimers[jid + ':close']) {
            clearTimeout(global.groupTimers[jid + ':close']);
        }

        const targetTime = new Date(Date.now() + durationMs).toLocaleTimeString();

        global.groupTimers[jid + ':close'] = setTimeout(async () => {
            try {
                await sock.groupSettingUpdate(jid, "announcement");
                await sock.sendMessage(jid, { text: "🔒 *Group Closed:* The scheduled time has arrived. Only admins can now send messages." });
            } catch (err) {
                console.error("Scheduled close error:", err);
            }
            delete global.groupTimers[jid + ':close'];
        }, durationMs);

        await sock.sendMessage(jid, { 
            text: `📅 *Close Scheduled:* The group will automatically close in *${args[0]}* (at *${targetTime}*).` 
        }, { quoted: msg });
    }
};
