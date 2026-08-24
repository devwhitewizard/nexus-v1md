const { DataTypes } = require("sequelize");
const { sequelize, isOnline } = require("./db");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const jsonStore = require("./jsonStore");
const { getSettings } = require("../lib/settings");
const messageCache = require("../lib/messageCache"); // Isolated fast cache for anti-delete

const TEMP_MEDIA_DIR = path.join(__dirname, "../temp_media");
if (!fs.existsSync(TEMP_MEDIA_DIR)) fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });

let MessageLog = null;

if (sequelize) {
    MessageLog = sequelize.define("MessageLog", {
        msgId: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        remoteJid: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        participant: {
            type: DataTypes.STRING, // For groups
        },
        pushName: {
            type: DataTypes.STRING,
        },
        messageType: {
            type: DataTypes.STRING,
        },
        content: {
            type: DataTypes.TEXT, // JSON stringified message content
        },
        mediaPath: {
            type: DataTypes.STRING,
        },
        timestamp: {
            type: DataTypes.BIGINT,
        }
    }, {
        timestamps: true,
    });
}

const saveMessage = async (m, sock) => {
    try {
        if (!m.message || m.message.protocolMessage) return;
        
        let mediaPath = null;
        const msgId = m.key.id;
        
        let message = m.message;
        while (message && (
            message.ephemeralMessage || 
            message.viewOnceMessageV2 || 
            message.viewOnceMessage || 
            message.viewOnceMessageV2Extension || 
            message.documentWithCaptionMessage
        )) {
            if (message.ephemeralMessage) message = message.ephemeralMessage.message;
            else if (message.viewOnceMessageV2) message = message.viewOnceMessageV2.message;
            else if (message.viewOnceMessage) message = message.viewOnceMessage.message;
            else if (message.viewOnceMessageV2Extension) message = message.viewOnceMessageV2Extension.message;
            else if (message.documentWithCaptionMessage) message = message.documentWithCaptionMessage.message;
            else break;
        }
        
        const mediaType = message.imageMessage ? "image" : 
                         (message.videoMessage || message.ptvMessage) ? "video" : 
                         message.audioMessage ? "audio" : 
                         message.stickerMessage ? "sticker" : 
                         message.documentMessage ? "document" : null;

        const settings = getSettings();
        const isViewOnce = m.message.viewOnceMessageV2 || m.message.viewOnceMessage;
        
        // Only download media if Anti-Delete, Status Anti-Delete, or View-Once is active
        const shouldDownload = isViewOnce || settings.antiDelete || settings.statusAntiDelete;

        if (mediaType && sock && shouldDownload) {
            try {
                const mediaMsg = message.imageMessage || message.videoMessage || message.ptvMessage || 
                                 message.audioMessage || message.stickerMessage || message.documentMessage;
                const size = mediaMsg?.fileLength ? parseInt(mediaMsg.fileLength, 10) : 0;
                const maxDownloadSize = 25 * 1024 * 1024; // Capped at 25MB

                if (!size || size < maxDownloadSize) {
                    let ext = "bin";
                    if (mediaType === "image") ext = "jpg";
                    else if (mediaType === "video") ext = "mp4";
                    else if (mediaType === "audio") ext = mediaMsg.mimetype?.includes("ogg") ? "ogg" : "mp3";
                    else if (mediaType === "sticker") ext = "webp";
                    else if (mediaType === "document") {
                        const rawFileName = mediaMsg.fileName || "file";
                        ext = path.extname(rawFileName).replace(".", "") || "bin";
                    }

                    const stream = await downloadContentFromMessage(mediaMsg, mediaType);
                    const chunks = [];
                    for await (const chunk of stream) {
                        chunks.push(chunk);
                    }
                    const buffer = Buffer.concat(chunks);
                    
                    const filePath = path.join(TEMP_MEDIA_DIR, `${msgId}.${ext}`);
                    await fs.promises.writeFile(filePath, buffer);
                    mediaPath = filePath;
                }
            } catch (err) {
                console.error("⚠️ Media download error in saveMessage:", err.message);
            }
        }

        // 🛡️ CRITICAL: Only attempt DB operation if database is actually ONLINE
        if (MessageLog && isOnline()) {
            await MessageLog.upsert({
                msgId: m.key.id,
                remoteJid: m.key.remoteJid,
                participant: m.key.participant || m.key.remoteJid,
                pushName: m.pushName,
                messageType: Object.keys(m.message)[0],
                content: JSON.stringify(m.message),
                mediaPath: mediaPath,
                timestamp: m.messageTimestamp,
            }).catch(() => {});
        } else {
            // 💾 Fast isolated cache — does NOT touch the main storage.json
            messageCache.setLog(m.key.id, {
                msgId: m.key.id,
                remoteJid: m.key.remoteJid,
                participant: m.key.participant || m.key.remoteJid,
                pushName: m.pushName,
                messageType: Object.keys(m.message)[0],
                content: m.message,
                mediaPath: mediaPath,
                timestamp: m.messageTimestamp,
            });
        }
        
        // 💾 In-Memory rolling buffer for AI Summarization (Zero Disk I/O overhead)
        const textContent = (message.conversation || message.extendedTextMessage?.text || message.imageMessage?.caption || "").trim();
        if (textContent) {
            const jid = m.key.remoteJid;
            if (!global.historyCache) global.historyCache = new Map();
            const history = global.historyCache.get(jid) || [];
            history.push({
                name: m.pushName || "User",
                text: textContent,
                time: m.messageTimestamp
            });
            
            // Keep only the last 50 messages in RAM
            if (history.length > 50) history.shift();
            global.historyCache.set(jid, history);
        }
        
        return null;

    } catch (e) {
        // Silently skip log errors
    }
};

const getMessage = async (msgId) => {
    try {
        if (MessageLog && isOnline()) {
            const log = await MessageLog.findByPk(msgId);
            return log ? { ...log.dataValues, content: JSON.parse(log.content) } : null;
        }
        // Fast in-memory cache lookup — zero disk I/O
        return messageCache.getLog(msgId) || null;
    } catch (e) {
        return null;
    }
};

const getGroupHistory = async (jid, limit = 50) => {
    try {
        // Preference 1: SQL Database
        if (MessageLog && isOnline()) {
            const logs = await MessageLog.findAll({
                where: { remoteJid: jid },
                order: [['timestamp', 'DESC']],
                limit: limit
            });
            return logs.map(l => ({
                name: l.pushName || "User",
                text: (JSON.parse(l.content).conversation || JSON.parse(l.content).extendedTextMessage?.text || ""),
                time: l.timestamp
            })).reverse();
        }
        
        // Preference 2: In-Memory History Cache
        if (global.historyCache && global.historyCache.has(jid)) {
            return global.historyCache.get(jid).slice(-limit);
        }
        
        // Preference 3: JSON Store Fallback
        const history = jsonStore.get(`history_${jid}`) || [];
        return history.slice(-limit);
    } catch (e) {
        return [];
    }
};

module.exports = { MessageLog, saveMessage, getMessage, getGroupHistory };
