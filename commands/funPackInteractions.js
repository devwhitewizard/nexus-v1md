const makeInteractionCommand = (name, actionText, emoji, requiresTarget = true) => {
    return {
        name,
        description: `${name.charAt(0).toUpperCase() + name.slice(1)} action command`,
        category: "social",
        execute: async ({ sock, jid, args, msg }) => {
            const sender = msg.key.participant || msg.key.remoteJid;
            
            if (!requiresTarget) {
                return await sock.sendMessage(jid, { 
                    text: `${emoji} *@${sender.split("@")[0]}* ${actionText}.`,
                    mentions: [sender]
                }, { quoted: msg });
            }

            const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                           msg.message?.extendedTextMessage?.contextInfo?.participant || 
                           (args[0] && args[0].includes("@") ? args[0] : null);

            if (!target) {
                return await sock.sendMessage(jid, { text: `⚠️ Please tag or reply to the user you want to ${name}.` }, { quoted: msg });
            }

            await sock.sendMessage(jid, {
                text: `${emoji} *@${sender.split("@")[0]}* ${actionText} *@${target.split("@")[0]}*!`,
                mentions: [sender, target]
            }, { quoted: msg });
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
