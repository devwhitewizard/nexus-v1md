const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'flagtext',
  aliases: [],
  category: 'textmaker',
  description: 'Create flag text effect',
  usage: '.flagtext <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.flagtext Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating flag text effect...*' }, { quoted: msg });
      const imageBuffer = await generateTextEffect('flagtext', text);
      
      await sock.sendMessage(jid, { image: imageBuffer, caption: `🚩 *FLAG TEXT EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
