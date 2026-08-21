const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'pubglogo',
  aliases: ['pubg', 'pubgtext'],
  category: 'textmaker',
  description: 'Create PUBG style logo text effect',
  usage: '.pubglogo <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.pubglogo Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating PUBG logo effect...*' }, { quoted: msg });
      const imageUrl = await generateTextEffect('pubglogo', text);
      
      await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `🎮 *PUBG LOGO EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
