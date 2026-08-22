const { generateTextEffect } = require('../../lib/textmaker');

module.exports = {
  name: 'fire',
  aliases: [],
  category: 'textmaker',
  description: 'Create fire flame text effect',
  usage: '.fire <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.fire Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating fire effect...*' }, { quoted: msg });
      const imageBuffer = await generateTextEffect('fire', text);
      
      await sock.sendMessage(jid, { image: imageBuffer, caption: `🔥 *FIRE EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
