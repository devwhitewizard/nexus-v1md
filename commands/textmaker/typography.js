const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'typography',
  aliases: ['typo', 'typefx'],
  category: 'textmaker',
  description: 'Create typography text effect',
  usage: '.typography <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.typography Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating typography effect...*' }, { quoted: msg });
      const imageUrl = await generateTextEffect('typography', text);
      
      await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `🔤 *TYPOGRAPHY EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
