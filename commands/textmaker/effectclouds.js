const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'effectclouds',
  aliases: [],
  category: 'textmaker',
  description: 'Create cloud effect text',
  usage: '.effectclouds <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.effectclouds Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating clouds effect...*' }, { quoted: msg });
      const imageBuffer = await generateTextEffect('effectclouds', text);
      
      await sock.sendMessage(jid, { image: imageBuffer, caption: `☁️ *EFFECT CLOUDS*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
