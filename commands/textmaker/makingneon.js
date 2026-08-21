const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'makingneon',
  aliases: ['makeneon', 'neonmaking'],
  category: 'textmaker',
  description: 'Create neon making text effect',
  usage: '.makingneon <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.makingneon Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating making neon effect...*' }, { quoted: msg });
      const imageUrl = await generateTextEffect('makingneon', text);
      
      await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `💡 *MAKING NEON EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
