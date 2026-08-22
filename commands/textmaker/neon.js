const { generateTextEffect } = require('../../lib/textmaker');

module.exports = {
  name: 'neon',
  aliases: [],
  category: 'textmaker',
  description: 'Create colorful neon light text effect',
  usage: '.neon <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.neon Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating neon effect...*' }, { quoted: msg });
      const imageBuffer = await generateTextEffect('neon', text);
      
      await sock.sendMessage(jid, { image: imageBuffer, caption: `🌈 *NEON EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
