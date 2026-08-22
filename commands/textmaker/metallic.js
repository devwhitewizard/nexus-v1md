const { generateTextEffect } = require('../../lib/textmaker');

module.exports = {
  name: 'metallic',
  aliases: [],
  category: 'textmaker',
  description: 'Create decorative 3D metallic text effect',
  usage: '.metallic <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.metallic Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating metallic effect...*' }, { quoted: msg });
      const imageBuffer = await generateTextEffect('metallic', text);
      
      await sock.sendMessage(jid, { image: imageBuffer, caption: `⚙️ *METALLIC EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
