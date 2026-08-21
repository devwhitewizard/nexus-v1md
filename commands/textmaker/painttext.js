const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'painttext',
  aliases: ['paint', 'brushtext'],
  category: 'textmaker',
  description: 'Create paint brush text effect',
  usage: '.painttext <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.painttext Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating paint text effect...*' }, { quoted: msg });
      const imageUrl = await generateTextEffect('painttext', text);
      
      await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `🎨 *PAINT TEXT EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
