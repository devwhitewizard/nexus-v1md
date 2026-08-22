const { generateTextEffect } = require('../../lib/textmaker');

module.exports = {
  name: 'arena',
  aliases: [],
  category: 'textmaker',
  description: 'Create arena text effect',
  usage: '.arena <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.arena Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating arena effect...*' }, { quoted: msg });
      const imageBuffer = await generateTextEffect('arena', text);
      
      await sock.sendMessage(jid, { image: imageBuffer, caption: `⚔️ *ARENA EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
