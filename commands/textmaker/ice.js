const { generateTextEffect } = require('../../lib/textmaker');

module.exports = {
  name: 'ice',
  aliases: [],
  category: 'textmaker',
  description: 'Create ice text effect',
  usage: '.ice <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.ice Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating ice effect...*' }, { quoted: msg });
      const imageBuffer = await generateTextEffect('ice', text);
      
      await sock.sendMessage(jid, { image: imageBuffer, caption: `🧊 *ICE EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
