const { generateTextEffect } = require('../../lib/textmaker');

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
      const imageUrl = await generateTextEffect('impressive', text);
      
      await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `🎨 *IMPRESSIVE EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
