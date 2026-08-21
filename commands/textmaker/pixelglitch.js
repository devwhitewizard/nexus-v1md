const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'pixelglitch',
  aliases: ['pixel', 'glitchpixel'],
  category: 'textmaker',
  description: 'Create pixel glitch text effect',
  usage: '.pixelglitch <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.pixelglitch Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating pixel glitch effect...*' }, { quoted: msg });
      const imageUrl = await generateTextEffect('pixelglitch', text);
      
      await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `📺 *PIXEL GLITCH EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
