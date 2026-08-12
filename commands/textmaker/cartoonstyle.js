const mumaker = require('mumaker');
module.exports = {
  name: 'cartoonstyle',
  aliases: ['cartoon', 'cartoontext'],
  category: 'textmaker',
  description: 'Create cartoon style text effect',
  usage: '.cartoonstyle <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.cartoonstyle Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating cartoon style effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/cartoon-style-text-effect-online-547.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🎪 *CARTOON STYLE EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
