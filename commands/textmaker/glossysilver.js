const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'glossysilver',
  aliases: ['silver'],
  category: 'textmaker',
  description: 'Create glossy silver text effect',
  usage: '.glossysilver <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.glossysilver Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating glossy silver effect...*' }, { quoted: msg });
      const imageUrl = await generateTextEffect('glossysilver', text);
      
      await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `🪙 *GLOSSY SILVER EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
