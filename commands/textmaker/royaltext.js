const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'royaltext',
  aliases: [],
  category: 'textmaker',
  description: 'Create royal text effect',
  usage: '.royaltext <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.royaltext Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating royal text effect...*' }, { quoted: msg });
      const imageBuffer = await generateTextEffect('royaltext', text);
      
      await sock.sendMessage(jid, { image: imageBuffer, caption: `👑 *ROYAL TEXT EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
