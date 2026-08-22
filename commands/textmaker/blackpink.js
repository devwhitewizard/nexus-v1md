const { generateTextEffect } = require('../../lib/textmaker');

module.exports = {
  name: 'blackpink',
  aliases: [],
  category: 'textmaker',
  description: 'Create blackpink style text effect',
  usage: '.blackpink <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.blackpink Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating blackpink effect...*' }, { quoted: msg });
      const imageBuffer = await generateTextEffect('blackpink', text);
      
      await sock.sendMessage(jid, { image: imageBuffer, caption: `🖤💗 *BLACKPINK EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
