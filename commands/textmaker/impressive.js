const mumaker = require('mumaker');

module.exports = {
  name: 'impressive',
  aliases: ['paint3d', 'colorful'],
  category: 'textmaker',
  description: 'Create impressive 3D colorful paint text effect',
  usage: '.impressive <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.impressive Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating impressive effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🎨 *IMPRESSIVE EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
