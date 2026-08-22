const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'wolfgalaxy',
  aliases: [],
  category: 'textmaker',
  description: 'Create wolf galaxy text effect',
  usage: '.wolfgalaxy <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.wolfgalaxy Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating wolf galaxy effect...*' }, { quoted: msg });
      const imageBuffer = await generateTextEffect('wolfgalaxy', text);
      
      await sock.sendMessage(jid, { image: imageBuffer, caption: `🐺 *WOLF GALAXY EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
