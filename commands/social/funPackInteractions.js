const ENDPOINTS = {
    hug: "hug",
    pat: "pat",
    slap: "slap",
    poke: "poke",
    tickle: "lick",
    bite: "bite",
    bonk: "bonk",
    yeet: "yeet",
    throw: "yeet",
    catch: "wink",
    highfive: "highfive",
    wave: "wave",
    stare: "smug",
    laugh: "smile",
    cry: "cry",
    angry: "cringe",
    dance: "dance",
    sleep: "happy",
    facepalm: "cringe",
    confuse: "smug",
    summon: "wink",
    follow: "wave",
    ignore: "smug",
    challenge: "kill",
    cheer: "happy"
};

const makeInteractionCommand = (name, actionText, emoji, requiresTarget = true) => {
    return {
        name,
        description: `${name.charAt(0).toUpperCase() + name.slice(1)} action command with animation`,
        category: "social",
        execute: async ({ sock, jid, args, msg }) => {
            const sender = msg.key.participant || msg.key.remoteJid;
            const target = requiresTarget 
                ? (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                   msg.message?.extendedTextMessage?.contextInfo?.participant || 
                   (args[0] && args[0].includes("@") ? args[0] : null))
                : null;

            if (requiresTarget && !target) {
                return await sock.sendMessage(jid, { text: `⚠️ Please tag or reply to the user you want to ${name}.` }, { quoted: msg });
            }

            const caption = requiresTarget 
                ? `${emoji} *@${sender.split("@")[0]}* ${actionText} *@${target.split("@")[0]}*!`
                : `${emoji} *@${sender.split("@")[0]}* ${actionText}.`;

            const mentions = requiresTarget ? [sender, target] : [sender];

            try {
                const axios = require("axios");
                const endpoint = ENDPOINTS[name] || "smile";
                const { data } = await axios.get(`https://api.waifu.pics/sfw/${endpoint}`);
                if (data && data.url) {
                    return await sock.sendMessage(jid, {
                        video: { url: data.url },
                        caption: caption,
                        gifPlayback: true,
                        mentions: mentions
                    }, { quoted: msg });
                }
            } catch (err) {
                console.error(`[Interaction API Error] for ${name}:`, err.message);
            }

            // Fallback to text message if API fails
            await sock.sendMessage(jid, { text: caption, mentions }, { quoted: msg });
        }
    };
};

module.exports = {
    hug: makeInteractionCommand("hug", "gave a warm, cozy hug to", "🤗"),
    pat: makeInteractionCommand("pat", "patted the head of", "🫳"),
    slap: makeInteractionCommand("slap", "slapped", "💥"),
    poke: makeInteractionCommand("poke", "poked", "👉"),
    tickle: makeInteractionCommand("tickle", "tickled", "🪶"),
    bite: makeInteractionCommand("bite", "bit", "🦷"),
    bonk: makeInteractionCommand("bonk", "bonked", "🔨"),
    yeet: makeInteractionCommand("yeet", "yeeted", "☄️"),
    throw: makeInteractionCommand("throw", "threw something at", "🎳"),
    catch: makeInteractionCommand("catch", "caught", "🧤"),
    highfive: makeInteractionCommand("highfive", "gave a high-five to", "🙌"),
    wave: makeInteractionCommand("wave", "waved at", "👋"),
    stare: makeInteractionCommand("stare", "is staring intensely at", "👀"),
    laugh: makeInteractionCommand("laugh", "laughed at", "😂"),
    cry: makeInteractionCommand("cry", "cried on the shoulder of", "😭"),
    angry: makeInteractionCommand("angry", "is extremely angry at", "😡"),
    dance: makeInteractionCommand("dance", "is dancing happily", "🕺", false),
    sleep: makeInteractionCommand("sleep", "went to sleep... zzz", "😴", false),
    facepalm: makeInteractionCommand("facepalm", "did a facepalm", "🤦", false),
    confuse: makeInteractionCommand("confuse", "looks completely confused at", "😕"),
    summon: makeInteractionCommand("summon", "summoned", "🔮"),
    follow: makeInteractionCommand("follow", "started following", "🚶‍♂️"),
    ignore: makeInteractionCommand("ignore", "is ignoring", "😑"),
    challenge: makeInteractionCommand("challenge", "challenged", "⚔️"),
    cheer: makeInteractionCommand("cheer", "cheered for", "🎉")
};
