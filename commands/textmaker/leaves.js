const { generateTextEffect } = require('../../lib/textmaker');

module.exports = {
  name: 'leaves',
  aliases: [],
  category: 'textmaker',
  description: 'Create green brush leaves text effect',
  usage: '.leaves <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.leaves Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating leaves effect...*' }, { quoted: msg });
      const imageBuffer = await generateTextEffect('leaves', text);
      
      await sock.sendMessage(jid, { image: imageBuffer, caption: `🍃 *LEAVES EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
