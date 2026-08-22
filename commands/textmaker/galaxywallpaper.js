const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'galaxywallpaper',
  aliases: [],
  category: 'textmaker',
  description: 'Create galaxy wallpaper text effect',
  usage: '.galaxywallpaper <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.galaxywallpaper Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating galaxy wallpaper effect...*' }, { quoted: msg });
      const imageBuffer = await generateTextEffect('galaxywallpaper', text);
      
      await sock.sendMessage(jid, { image: imageBuffer, caption: `🌠 *GALAXY WALLPAPER EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
