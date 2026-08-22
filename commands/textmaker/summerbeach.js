const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'summerbeach',
  aliases: [],
  category: 'textmaker',
  description: 'Create summer beach text effect',
  usage: '.summerbeach <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.summerbeach Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating summer beach effect...*' }, { quoted: msg });
      const imageBuffer = await generateTextEffect('summerbeach', text);
      
      await sock.sendMessage(jid, { image: imageBuffer, caption: `🏖️ *SUMMER BEACH EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
