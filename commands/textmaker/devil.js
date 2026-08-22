const { generateTextEffect } = require('../../lib/textmaker');

module.exports = {
  name: 'devil',
  aliases: [],
  category: 'textmaker',
  description: 'Create devil neon wings text effect',
  usage: '.devil <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.devil Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating devil effect...*' }, { quoted: msg });
      const imageBuffer = await generateTextEffect('devil', text);
      
      await sock.sendMessage(jid, { image: imageBuffer, caption: `😈 *DEVIL EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
