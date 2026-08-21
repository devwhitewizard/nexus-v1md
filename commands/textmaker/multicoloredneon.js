const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'multicoloredneon',
  aliases: ['rainbowneon', 'colorneon'],
  category: 'textmaker',
  description: 'Create multicolored neon text effect',
  usage: '.multicoloredneon <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.multicoloredneon Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating multicolored neon effect...*' }, { quoted: msg });
      const imageUrl = await generateTextEffect('multicoloredneon', text);
      
      await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `🌈 *MULTICOLORED NEON EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
