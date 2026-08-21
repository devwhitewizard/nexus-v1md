const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'underwater',
  aliases: ['aqua', 'ocean'],
  category: 'textmaker',
  description: 'Create underwater text effect',
  usage: '.underwater <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.underwater Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating underwater effect...*' }, { quoted: msg });
      const imageUrl = await generateTextEffect('underwater', text);
      
      await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `🌊 *UNDERWATER EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
