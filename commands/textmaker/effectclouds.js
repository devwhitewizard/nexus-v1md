const mumaker = require('mumaker');
module.exports = {
  name: 'effectclouds',
  aliases: ['clouds', 'cloudtext'],
  category: 'textmaker',
  description: 'Create cloud effect text',
  usage: '.effectclouds <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.effectclouds Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating clouds effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/create-text-effect-in-clouds-online-559.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `☁️ *EFFECT CLOUDS*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
