const { setGame, getGame } = require("../../lib/gameState");

function renderBoard(board) {
    const S = (v) => v === 1 ? "❌" : v === 2 ? "⭕" : "⬜";
    return [0, 3, 6].map(r => board.slice(r, r + 3).map(S).join("")).join("\n");
}

module.exports = {
    name: "tictactoe",
    aliases: ["ttt", "xo"],
    description: "Challenge someone to Tic-Tac-Toe! Usage: .tictactoe @user",
    category: "games",
    execute: async ({ sock, jid, sender, msg }) => {
        // Check for ongoing game
        const existing = getGame(jid);
        if (existing?.type === "tictactoe") {
            const { board, players, turn } = existing.data;
            return await sock.sendMessage(jid, {
                text:
                    `⚠️ A game is already in progress!\n\n` +
                    `${renderBoard(board)}\n\n` +
                    `${turn === 0 ? "❌" : "⭕"} @${players[turn].split("@")[0]}'s turn\n` +
                    `_Type 1-9 to make your move._`,
                mentions: [players[turn]]
            });
        }

        // Extract mentioned opponent
        const mentionedJid =
            msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
            msg.message?.imageMessage?.contextInfo?.mentionedJid?.[0];

        if (!mentionedJid) {
            return await sock.sendMessage(jid, {
                text: "❓ *Usage:* `.tictactoe @user`\n\nMention the player you want to challenge!"
            });
        }

        if (mentionedJid === sender) {
            return await sock.sendMessage(jid, { text: "😄 You can't challenge yourself! Mention someone else." });
        }

        const players = [sender, mentionedJid];
        const emptyBoard = new Array(9).fill(0);

        setGame(jid, "tictactoe", { board: emptyBoard, players, turn: 0 });

        await sock.sendMessage(jid, {
            text:
                `🎮 *TIC-TAC-TOE*\n\n` +
                `❌ @${sender.split("@")[0]}   vs   ⭕ @${mentionedJid.split("@")[0]}\n\n` +
                `${renderBoard(emptyBoard)}\n\n` +
                `❌ @${sender.split("@")[0]} goes first!\n` +
                `_Type 1-9 to place your piece:_\n` +
                `1️⃣2️⃣3️⃣\n4️⃣5️⃣6️⃣\n7️⃣8️⃣9️⃣`,
            mentions: players
        }, { quoted: msg });
    }
};
