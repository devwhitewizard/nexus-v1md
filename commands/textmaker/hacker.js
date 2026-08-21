const { generateTextEffect } = require('../../lib/textmaker');

module.exports = {
  name: 'hacker',
  aliases: ['anonymous', 'cyber'],
  category: 'textmaker',
  description: 'Create anonymous hacker neon text effect',
  usage: '.hacker <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.hacker Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating hacker effect...*' }, { quoted: msg });
      const imageUrl = await generateTextEffect('hacker', text);
      
      await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `🕵️ *HACKER EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
