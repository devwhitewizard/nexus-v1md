const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'corntext',
  aliases: ['corn', 'cornlogo'],
  category: 'textmaker',
  description: 'Create corn style text effect',
  usage: '.corntext <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.corntext Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating corn text effect...*' }, { quoted: msg });
      const imageUrl = await generateTextEffect('corntext', text);
      
      await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `🌽 *CORN TEXT EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
