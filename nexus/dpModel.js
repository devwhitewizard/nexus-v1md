const { DataTypes } = require("sequelize");
const { sequelize, isOnline } = require("./db");
const jsonStore = require("./jsonStore");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const crypto = require("crypto");

let DpHistory = null;

if (sequelize) {
    DpHistory = sequelize.define("DpHistory", {
        jid: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        imageUrl: {
            type: DataTypes.STRING(1000), // High capacity for long URLs
            allowNull: false,
        },
        localPath: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        hash: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    }, {
        timestamps: true,
    });

    // Sync individual model automatically if loaded after global sync
    DpHistory.sync({ alter: true }).catch(err => {
        console.error("❌ Failed to sync DpHistory model:", err.message);
    });
}

const getHash = (buffer) => {
    return crypto.createHash("md5").update(buffer).digest("hex");
};

const saveDpRecord = async (jid, imageUrl, localPath, hash) => {
    const timestamp = new Date();
    if (DpHistory && isOnline()) {
        try {
            await DpHistory.create({ jid, imageUrl, localPath, hash });
        } catch (e) {
            console.error("❌ Failed to save DP record to DB:", e.message);
        }
    } else {
        const key = `dp_history_${jid}`;
        const history = jsonStore.get(key, []);
        history.unshift({ jid, imageUrl, localPath, hash, createdAt: timestamp });
        // Limit history to 20 entries per user to save disk space
        if (history.length > 20) {
            const removed = history.pop();
            if (removed && removed.localPath && fs.existsSync(removed.localPath)) {
                try { fs.unlinkSync(removed.localPath); } catch (err) {}
            }
        }
        jsonStore.set(key, history);
    }
};

const getDpHistory = async (jid) => {
    if (DpHistory && isOnline()) {
        try {
            const records = await DpHistory.findAll({
                where: { jid },
                order: [["createdAt", "DESC"]]
            });
            return records.map(r => r.dataValues);
        } catch (e) {
            console.error("❌ Failed to fetch DP history from DB:", e.message);
        }
    }
    const key = `dp_history_${jid}`;
    return jsonStore.get(key, []);
};

const trackDp = async (sock, jid) => {
    try {
        let dpUrl;
        try {
            dpUrl = await sock.profilePictureUrl(jid, 'image');
        } catch (e) {
            return { changed: false, error: "No public profile picture found." };
        }

        const history = await getDpHistory(jid);
        const lastRecord = history[0];

        // Fetch current picture bytes to check hash
        const response = await axios.get(dpUrl, { responseType: 'arraybuffer', timeout: 15000 });
        const buffer = Buffer.from(response.data);
        const hash = getHash(buffer);

        if (lastRecord && lastRecord.hash === hash) {
            return { changed: false, imageUrl: dpUrl, localPath: lastRecord.localPath, hash };
        }

        // Changed or brand new DP!
        const cleanJid = jid.split("@")[0];
        const fileName = `${cleanJid}_${Date.now()}.png`;
        const dir = path.join(__dirname, "../assets/dp_history");
        fs.mkdirSync(dir, { recursive: true });
        const localPath = path.join(dir, fileName);
        
        fs.writeFileSync(localPath, buffer);
        await saveDpRecord(jid, dpUrl, localPath, hash);

        return { changed: true, imageUrl: dpUrl, localPath, hash };
    } catch (e) {
        console.error("❌ trackDp Error:", e.message);
        return { changed: false, error: e.message };
    }
};

module.exports = {
    trackDp,
    getDpHistory
};
