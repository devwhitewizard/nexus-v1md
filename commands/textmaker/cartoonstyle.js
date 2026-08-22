const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'cartoonstyle',
  aliases: [],
  category: 'textmaker',
  description: 'Create cartoon style text effect',
  usage: '.cartoonstyle <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.cartoonstyle Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating cartoon style effect...*' }, { quoted: msg });
      const imageBuffer = await generateTextEffect('cartoonstyle', text);
      
      await sock.sendMessage(jid, { image: imageBuffer, caption: `🎪 *CARTOON STYLE EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
