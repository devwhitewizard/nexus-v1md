const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'blackpinkstyle',
  aliases: [],
  category: 'textmaker',
  description: 'Create Blackpink style logo effect',
  usage: '.blackpinkstyle <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.blackpinkstyle Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating Blackpink style effect...*' }, { quoted: msg });
      const imageBuffer = await generateTextEffect('blackpinkstyle', text);
      
      await sock.sendMessage(jid, { image: imageBuffer, caption: `💗 *BLACKPINK STYLE EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
