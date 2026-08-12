const mumaker = require('mumaker');
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
      const result = await mumaker.ephoto('https://en.ephoto360.com/glowing-text-effect-online-534.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `✨ *GLOWING TEXT EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
