const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'luxurygold',
  aliases: ['gold'],
  category: 'textmaker',
  description: 'Create luxury gold text effect',
  usage: '.luxurygold <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.luxurygold Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating luxury gold effect...*' }, { quoted: msg });
      const imageUrl = await generateTextEffect('luxurygold', text);
      
      await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `🥇 *LUXURY GOLD EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
