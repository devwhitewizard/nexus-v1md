const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'flux',
  aliases: [],
  category: 'textmaker',
  description: 'Create flux text effect',
  usage: '.flux <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.flux Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating flux effect...*' }, { quoted: msg });
      const imageBuffer = await generateTextEffect('flux', text);
      
      await sock.sendMessage(jid, { image: imageBuffer, caption: `⚡ *FLUX EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
