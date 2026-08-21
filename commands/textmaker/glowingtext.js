const { generateTextEffect } = require('../../lib/textmaker');

module.exports = {
  name: 'glowingtext',
  aliases: ['glow', 'glowtext'],
  category: 'textmaker',
  description: 'Create glowing text effect',
  usage: '.glowingtext <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.glowingtext Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating glowing text effect...*' }, { quoted: msg });
      const imageUrl = await generateTextEffect('https://textpro.me/create-glowing-neon-light-text-effect-online-1061.html', text);
      await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `✨ *GLOWING TEXT EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
