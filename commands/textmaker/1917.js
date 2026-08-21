const { generateTextEffect } = require('../../lib/textmaker');

module.exports = {
  name: '1917',
  aliases: [],
  category: 'textmaker',
  description: 'Create 1917 style text effect',
  usage: '.1917 <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.1917 Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating 1917 effect...*' }, { quoted: msg });
      const imageUrl = await generateTextEffect('1917', text);
      
      await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `🎬 *1917 EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
