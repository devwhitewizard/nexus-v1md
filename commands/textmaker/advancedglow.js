const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'advancedglow',
  aliases: [],
  category: 'textmaker',
  description: 'Create advanced glow text effect',
  usage: '.advancedglow <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.advancedglow Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating advanced glow effect...*' }, { quoted: msg });
      const imageBuffer = await generateTextEffect('advancedglow', text);
      
      await sock.sendMessage(jid, { image: imageBuffer, caption: `💫 *ADVANCED GLOW EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
