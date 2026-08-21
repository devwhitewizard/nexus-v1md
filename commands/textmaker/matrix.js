const { generateTextEffect } = require('../../lib/textmaker');

module.exports = {
  name: 'matrix',
  aliases: ['code', 'greencode'],
  category: 'textmaker',
  description: 'Create matrix code text effect',
  usage: '.matrix <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.matrix Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating matrix effect...*' }, { quoted: msg });
      const imageUrl = await generateTextEffect('matrix', text);
      
      await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `🖥️ *MATRIX EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
