const { generateTextEffect } = require('../../lib/textmaker');

module.exports = {
  name: 'glitch',
  aliases: ['digital'],
  category: 'textmaker',
  description: 'Create digital glitch text effect',
  usage: '.glitch <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.glitch Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating glitch effect...*' }, { quoted: msg });
      const imageUrl = await generateTextEffect('glitch', text);
      
      await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `📡 *GLITCH EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
