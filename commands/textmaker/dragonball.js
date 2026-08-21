const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'dragonball',
  aliases: ['dbz', 'dragonballtext'],
  category: 'textmaker',
  description: 'Create Dragon Ball Z text effect',
  usage: '.dragonball <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.dragonball Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating Dragon Ball Z effect...*' }, { quoted: msg });
      const imageUrl = await generateTextEffect('dragonball', text);
      
      await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `⚡ *DRAGON BALL EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
