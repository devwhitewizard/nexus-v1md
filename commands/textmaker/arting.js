const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'arting',
  aliases: ['art', 'arttext'],
  category: 'textmaker',
  description: 'Create artistic text effect',
  usage: '.arting <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.arting Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating arting effect...*' }, { quoted: msg });
      const imageUrl = await generateTextEffect('arting', text);
      
      await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `🎭 *ARTING EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
