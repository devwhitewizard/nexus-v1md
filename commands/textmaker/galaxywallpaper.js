const mumaker = require('mumaker');
module.exports = {
  name: 'galaxywallpaper',
  aliases: ['galaxybg', 'spacewall'],
  category: 'textmaker',
  description: 'Create galaxy wallpaper text effect',
  usage: '.galaxywallpaper <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.galaxywallpaper Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating galaxy wallpaper effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/create-galaxy-wallpaper-text-online-541.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🌠 *GALAXY WALLPAPER EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
