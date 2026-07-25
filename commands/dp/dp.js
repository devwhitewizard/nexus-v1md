const { Jimp } = require("jimp");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { trackDp, getDpHistory } = require("../../nexus/dpModel");

const DEFAULT_AVATAR = "https://i.imgur.com/8Q4sLzJ.png";

// Curated overlay templates (transparency built-in)
const OVERLAY_TEMPLATES = {
    jail: "https://i.imgur.com/7gN6s8x.png",
    clown: "https://i.imgur.com/mZtZ8f6.png",
    trash: "https://i.imgur.com/kE9gD6S.png",
    rip: "https://i.imgur.com/lMscf2c.png",
    wanted: "https://i.imgur.com/bHw2jK5.png",
    sus: "https://i.imgur.com/c1pE6mC.png"
};

// Interaction configurations
const INTERACTION_CONFIGS = {
    slap: {
        url: "https://i.imgur.com/vH9h7Z8.png",
        sender: { x: 350, y: 70, w: 120, h: 120 },
        target: { x: 120, y: 220, w: 110, h: 110 }
    },
    hug: {
        url: "https://i.imgur.com/G5y7fC2.png",
        sender: { x: 130, y: 100, w: 90, h: 90 },
        target: { x: 280, y: 110, w: 90, h: 90 }
    },
    bonk: {
        url: "https://i.imgur.com/t9D2v8a.png",
        sender: { x: 120, y: 100, w: 110, h: 110 },
        target: { x: 420, y: 200, w: 100, h: 100 }
    },
    pat: {
        url: "https://i.imgur.com/D4sXz99.png",
        sender: { x: 0, y: 0, w: 0, h: 0 }, // Unused for petpet base
        target: { x: 50, y: 100, w: 300, h: 300 }
    }
};

const RATING_CAPTIONS = [
    "🔥 *Immaculate!* Your DP is radiating main character energy. *10/10!*",
    "😎 *Looking sharp!* The group chat is blessed by this presence. *9/10.*",
    "✨ *Absolutely charming.* A solid *8.5/10* aura points.",
    "😐 *Average fit.* Looks like a stock photo, but not bad. *6/10.*",
    "💀 *Cringe alert.* Are you using a template or did you take this in the dark? *4/10.*",
    "🌟 *Gorgeous!* The aesthetic is top-tier. *9.5/10.*",
    "👀 *Interesting choice...* is that a selfie or a crop of a crop? *7/10.*",
    "👑 *King/Queen status.* Elegant, clean, and professional. *9.8/10.*"
];

// Helper Functions
const getTarget = (msg, args, sender) => {
    let target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                 (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage ? msg.message.extendedTextMessage.contextInfo.participant : null) ||
                 msg.message?.extendedTextMessage?.contextInfo?.participant ||
                 null;

    if (!target && args[0]) {
        const cleanNum = args[0].replace(/[^0-9]/g, "");
        if (cleanNum.length >= 8) {
            target = `${cleanNum}@s.whatsapp.net`;
        }
    }
    return target || sender;
};

const getDpUrl = async (sock, jid) => {
    try {
        return await sock.profilePictureUrl(jid, 'image');
    } catch (e) {
        try {
            return await sock.profilePictureUrl(jid, 'preview');
        } catch (err) {
            return DEFAULT_AVATAR;
        }
    }
};

const getDpBuffer = async (sock, jid) => {
    const url = await getDpUrl(sock, jid);
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
    return Buffer.from(response.data);
};

const applyJimpEffect = async (buffer, effectFn) => {
    const img = await Jimp.read(buffer);
    // Downscale immediately to 300x300 to prevent CPU spikes on filters (like convolution or blur)
    if (img.width > 300 || img.height > 300) {
        img.resize({ w: 300, h: 300 });
    }
    effectFn(img);
    return await img.getBuffer("image/png");
};

const applyOverlay = async (userBuffer, templateUrl) => {
    const userImg = await Jimp.read(userBuffer);
    const templateImg = await Jimp.read(templateUrl);
    
    // Scale user picture down to 300x300 to reduce CPU/memory footprint
    userImg.resize({ w: 300, h: 300 });
    templateImg.resize({ w: 300, h: 300 });
    
    userImg.composite(templateImg, 0, 0);
    return await userImg.getBuffer("image/png");
};

const applyInteraction = async (senderBuffer, targetBuffer, configName) => {
    const config = INTERACTION_CONFIGS[configName];
    const templateImg = await Jimp.read(config.url);
    const senderImg = await Jimp.read(senderBuffer);
    const targetImg = await Jimp.read(targetBuffer);

    // Downscale template image to a max width of 500 pixels to optimize CPU/RAM
    let scale = 1;
    if (templateImg.width > 500) {
        scale = 500 / templateImg.width;
        templateImg.resize({ w: 500, h: Math.round(templateImg.height * scale) });
    }

    if (configName === "pat") {
        // Special case for petpet: Base target DP, overlay petting hand on top
        const base = new Jimp({ width: 300, height: 300, color: 0xffffffff });
        targetImg.resize({ w: Math.round(config.target.w * scale), h: Math.round(config.target.h * scale) });
        templateImg.resize({ w: 150, h: 110 }); // scale pat hand
        base.composite(targetImg, Math.round(config.target.x * scale), Math.round(config.target.y * scale));
        base.composite(templateImg, 15, 10);
        return await base.getBuffer("image/png");
    }

    const sw = Math.round(config.sender.w * scale);
    const sh = Math.round(config.sender.h * scale);
    const sx = Math.round(config.sender.x * scale);
    const sy = Math.round(config.sender.y * scale);

    const tw = Math.round(config.target.w * scale);
    const th = Math.round(config.target.h * scale);
    const tx = Math.round(config.target.x * scale);
    const ty = Math.round(config.target.y * scale);

    senderImg.resize({ w: sw, h: sh }).circle();
    targetImg.resize({ w: tw, h: th }).circle();

    templateImg.composite(targetImg, tx, ty);
    templateImg.composite(senderImg, sx, sy);

    return await templateImg.getBuffer("image/png");
};

// Create a generic command template for single effects
const makeEffectCommand = (name, desc, effectFn) => {
    return {
        name,
        description: desc,
        category: "dp",
        execute: async ({ sock, jid, msg, args, sender }) => {
            try {
                const target = getTarget(msg, args, sender);
                await sock.sendMessage(jid, { text: "⏳ *Applying DP Effect...* Please wait." }, { quoted: msg });
                
                const buffer = await getDpBuffer(sock, target);
                const result = await applyJimpEffect(buffer, effectFn);
                
                await sock.sendMessage(jid, {
                    image: result,
                    caption: `🎨 *DP Effect Applied:* \`${name}\`\n🛡️ *Nexus-1MD Image Studio*`
                }, { quoted: msg });
            } catch (e) {
                console.error(`Error in !${name}:`, e);
                await sock.sendMessage(jid, { text: "❌ Failed to apply DP effect. Please try again." }, { quoted: msg });
            }
        }
    };
};

// Create a generic command template for single overlays
const makeOverlayCommand = (name, desc, type) => {
    return {
        name,
        description: desc,
        category: "dp",
        execute: async ({ sock, jid, msg, args, sender }) => {
            try {
                const target = getTarget(msg, args, sender);
                await sock.sendMessage(jid, { text: "⏳ *Generating Funny DP Edit...* Please wait." }, { quoted: msg });
                
                const buffer = await getDpBuffer(sock, target);
                const result = await applyOverlay(buffer, OVERLAY_TEMPLATES[type]);
                
                await sock.sendMessage(jid, {
                    image: result,
                    caption: `😂 *Funny DP Edit:* \`${name}\`\n🛡️ *Nexus-1MD Fun Studio*`
                }, { quoted: msg });
            } catch (e) {
                console.error(`Error in !${name}:`, e);
                await sock.sendMessage(jid, { text: "❌ Failed to generate Funny DP Edit." }, { quoted: msg });
            }
        }
    };
};

// Create a generic command template for interactions
const makeInteractionCommand = (name, desc, configName) => {
    return {
        name,
        description: desc,
        category: "dp",
        execute: async ({ sock, jid, msg, args, sender }) => {
            try {
                const target = getTarget(msg, args, sender);
                if (target === sender) {
                    return await sock.sendMessage(jid, { text: "❌ Please mention or quote another user to interact with!" }, { quoted: msg });
                }
                
                await sock.sendMessage(jid, { text: "⏳ *Composing Interaction DP...* Please wait." }, { quoted: msg });
                
                const senderBuf = await getDpBuffer(sock, sender);
                const targetBuf = await getDpBuffer(sock, target);
                const result = await applyInteraction(senderBuf, targetBuf, configName);
                
                await sock.sendMessage(jid, {
                    image: result,
                    caption: `🎭 *Interaction DP:* @${sender.split("@")[0]} slaps/hugs/bonks @${target.split("@")[0]}!`,
                    mentions: [sender, target]
                }, { quoted: msg });
            } catch (e) {
                console.error(`Error in !${name}:`, e);
                await sock.sendMessage(jid, { text: "❌ Failed to compose Interaction DP." }, { quoted: msg });
            }
        }
    };
};

// Commands Export
module.exports = {
    // 👤 Basic DP Commands
    dp: {
        name: "dp",
        aliases: ["viewdp", "showdp"],
        description: "Get a user's profile picture",
        category: "dp",
        execute: async ({ sock, jid, msg, args, sender }) => {
            try {
                const target = getTarget(msg, args, sender);
                const url = await getDpUrl(sock, target);
                
                await sock.sendMessage(jid, {
                    image: { url },
                    caption: `👤 *DP Request*\n👤 *User:* @${target.split("@")[0]}\n\n_Nexus-1MD Utilities_`,
                    mentions: [target]
                }, { quoted: msg });
            } catch (e) {
                await sock.sendMessage(jid, { text: "❌ Could not retrieve profile picture." }, { quoted: msg });
            }
        }
    },
    dpfull: {
        name: "dpfull",
        description: "Get HD version of a user's profile picture",
        category: "dp",
        execute: async ({ sock, jid, msg, args, sender }) => {
            try {
                const target = getTarget(msg, args, sender);
                const url = await sock.profilePictureUrl(target, 'image').catch(() => getDpUrl(sock, target));
                
                await sock.sendMessage(jid, {
                    image: { url },
                    caption: `🌟 *HD Profile Picture*\n👤 *User:* @${target.split("@")[0]}`,
                    mentions: [target]
                }, { quoted: msg });
            } catch (e) {
                await sock.sendMessage(jid, { text: "❌ Could not retrieve HD profile picture." }, { quoted: msg });
            }
        }
    },
    dpview: {
        name: "dpview",
        description: "View a profile picture clearly",
        category: "dp",
        execute: async ({ sock, jid, msg, args, sender }) => {
            try {
                const target = getTarget(msg, args, sender);
                const url = await getDpUrl(sock, target);
                await sock.sendMessage(jid, {
                    image: { url },
                    caption: `👁️ *DP VIEW*\n👤 *User:* @${target.split("@")[0]}`,
                    mentions: [target]
                }, { quoted: msg });
            } catch (e) {
                await sock.sendMessage(jid, { text: "❌ Could not view profile picture." }, { quoted: msg });
            }
        }
    },
    mydp: {
        name: "mydp",
        description: "Show your own profile picture",
        category: "dp",
        execute: async ({ sock, jid, msg, sender }) => {
            try {
                const url = await getDpUrl(sock, sender);
                await sock.sendMessage(jid, {
                    image: { url },
                    caption: `👤 *Your Profile Picture*\n\n_Nexus-1MD Utilities_`
                }, { quoted: msg });
            } catch (e) {
                await sock.sendMessage(jid, { text: "❌ Could not retrieve your profile picture." }, { quoted: msg });
            }
        }
    },

    // 🎨 DP Effects (uses Jimp)
    dpblur: makeEffectCommand("dpblur", "Apply blur to a user's DP", (img) => img.blur(8)),
    dpglitch: makeEffectCommand("dpglitch", "Apply glitch effect to a user's DP", (img) => {
        img.color([{ apply: 'red', params: [40] }, { apply: 'blue', params: [-20] }]).pixelate(3).fisheye();
    }),
    dpinvert: makeEffectCommand("dpinvert", "Invert the colors of a user's DP", (img) => img.invert()),
    dpbw: makeEffectCommand("dpbw", "Make a user's DP black and white", (img) => img.greyscale()),
    dppixel: makeEffectCommand("dppixel", "Pixelate a user's DP", (img) => img.pixelate(8)),
    dpsketch: makeEffectCommand("dpsketch", "Apply sketch filter to a user's DP", (img) => {
        img.greyscale().contrast(0.8).convolute([
            [-1, -1, -1],
            [-1,  8, -1],
            [-1, -1, -1]
        ]).invert();
    }),
    dpneon: makeEffectCommand("dpneon", "Apply glowing neon borders to a user's DP", (img) => {
        img.convolute([
            [-1, -1, -1],
            [-1,  8, -1],
            [-1, -1, -1]
        ]).color([{ apply: 'red', params: [100] }, { apply: 'blue', params: [50] }]);
    }),
    dpvintage: makeEffectCommand("dpvintage", "Apply vintage filter to a user's DP", (img) => {
        img.sepia().color([{ apply: 'red', params: [15] }, { apply: 'green', params: [-10] }]).contrast(0.2);
    }),
    dpdeepfry: makeEffectCommand("dpdeepfry", "Deepfry a user's DP", (img) => {
        img.contrast(1.0).color([
            { apply: 'saturate', params: [100] },
            { apply: 'red', params: [30] }
        ]).pixelate(2).contrast(0.5);
    }),

    // 😂 Funny DP Edits
    jaildp: makeOverlayCommand("jaildp", "Put a user's DP in jail", "jail"),
    clowndp: makeOverlayCommand("clowndp", "Make a user's DP look like a clown", "clown"),
    trashdp: makeOverlayCommand("trashdp", "Overlay a trash can on a user's DP", "trash"),
    ripdp: makeOverlayCommand("ripdp", "Create a tombstone edit of a user's DP", "rip"),
    wanteddp: makeOverlayCommand("wanteddp", "Put a user's DP on a wanted poster", "wanted"),
    susdp: makeOverlayCommand("susdp", "Create Among Us Impostor edit of a user's DP", "sus"),

    // 🎭 Interaction DP
    slapdp: makeInteractionCommand("slapdp", "Slap someone's DP (Batman slap Robin)", "slap"),
    hugdp: makeInteractionCommand("hugdp", "Hug someone's DP", "hug"),
    bonkdp: makeInteractionCommand("bonkdp", "Bonk someone's DP (Doge bonks Cheems)", "bonk"),
    patdp: makeInteractionCommand("patdp", "Pet someone's DP (Petpet style)", "pat"),

    // 🔥 Smart / Useful DP
    dpsave: {
        name: "dpsave",
        description: "Save a user's profile picture as an uncompressed document",
        category: "dp",
        execute: async ({ sock, jid, msg, args, sender }) => {
            try {
                const target = getTarget(msg, args, sender);
                await sock.sendMessage(jid, { text: "⏳ *Preparing uncompressed file...*" }, { quoted: msg });
                
                const buffer = await getDpBuffer(sock, target);
                
                await sock.sendMessage(jid, {
                    document: buffer,
                    mimetype: "image/png",
                    fileName: `${target.split("@")[0]}_dp.png`,
                    caption: `💾 *DP Saved Successfully*`
                }, { quoted: msg });
            } catch (e) {
                await sock.sendMessage(jid, { text: "❌ Failed to save DP." }, { quoted: msg });
            }
        }
    },
    dphistory: {
        name: "dphistory",
        description: "Show previous profile pictures for a user (if stored)",
        category: "dp",
        execute: async ({ sock, jid, msg, args, sender }) => {
            try {
                const target = getTarget(msg, args, sender);
                
                // Track latest DP to keep archive fresh before reading history
                await trackDp(sock, target).catch(() => {});
                
                const history = await getDpHistory(target);
                
                if (!history || history.length === 0) {
                    return await sock.sendMessage(jid, { text: "❌ *No DP history stored yet.* Run some DP commands to start archiving!" }, { quoted: msg });
                }
                
                await sock.sendMessage(jid, { 
                    text: `📅 *DP History Archive* for @${target.split("@")[0]}:\nFound ${history.length} archived pictures. Sending the last few...`, 
                    mentions: [target] 
                }, { quoted: msg });
                
                // Send up to 3 most recent archived DPs
                for (let i = 0; i < Math.min(3, history.length); i++) {
                    const record = history[i];
                    const dateStr = new Date(record.createdAt).toLocaleString("en-GB", { timeZone: "Africa/Nairobi" });
                    
                    if (record.localPath && fs.existsSync(record.localPath)) {
                        await sock.sendMessage(jid, {
                            image: { url: record.localPath },
                            caption: `📅 *Archived On:* ${dateStr}`
                        });
                    } else {
                        await sock.sendMessage(jid, {
                            image: { url: record.imageUrl },
                            caption: `📅 *Archived On:* ${dateStr} (Remote Link)`
                        });
                    }
                }
            } catch (e) {
                console.error("Error in !dphistory:", e);
                await sock.sendMessage(jid, { text: "❌ Failed to retrieve DP history." }, { quoted: msg });
            }
        }
    },
    dpdetect: {
        name: "dpdetect",
        description: "Check if a user has changed their profile picture",
        category: "dp",
        execute: async ({ sock, jid, msg, args, sender }) => {
            try {
                const target = getTarget(msg, args, sender);
                await sock.sendMessage(jid, { text: "🔍 *Checking if profile picture has changed...*" }, { quoted: msg });
                
                const result = await trackDp(sock, target);
                
                if (result.error) {
                    return await sock.sendMessage(jid, { text: `❌ *Error:* ${result.error}` }, { quoted: msg });
                }
                
                if (result.changed) {
                    await sock.sendMessage(jid, {
                        image: { url: result.localPath || result.imageUrl },
                        caption: `🚨 *DP CHANGE DETECTED!*\n\nThis user has updated their profile picture. The new DP has been archived in the history.`
                    }, { quoted: msg });
                } else {
                    await sock.sendMessage(jid, { text: "✅ *No change detected.* The user is still using their last archived profile picture." }, { quoted: msg });
                }
            } catch (e) {
                console.error("Error in !dpdetect:", e);
                await sock.sendMessage(jid, { text: "❌ Failed to run DP detection check." }, { quoted: msg });
            }
        }
    },
    dprate: {
        name: "dprate",
        description: "Rate a user's profile picture",
        category: "dp",
        execute: async ({ sock, jid, msg, args, sender }) => {
            try {
                const target = getTarget(msg, args, sender);
                
                // Deterministic random rating based JID/Day so it doesn't change every second
                const seed = `${target}_${new Date().toDateString()}`;
                let hashNum = 0;
                for (let i = 0; i < seed.length; i++) {
                    hashNum = seed.charCodeAt(i) + ((hashNum << 5) - hashNum);
                }
                const index = Math.abs(hashNum) % RATING_CAPTIONS.length;
                const caption = RATING_CAPTIONS[index];
                
                const url = await getDpUrl(sock, target);
                
                await sock.sendMessage(jid, {
                    image: { url },
                    caption: `📊 *DP RATING REPORT*\n━━━━━━━━━━━━━━━━━━━\n\n👤 *User:* @${target.split("@")[0]}\n📝 *Rating:* ${caption}\n\n━━━━━━━━━━━━━━━━━━━\n_Nexus-1MD Aesthetics Engine_`,
                    mentions: [target]
                }, { quoted: msg });
            } catch (e) {
                await sock.sendMessage(jid, { text: "❌ Could not rate profile picture." }, { quoted: msg });
            }
        }
    }
};
