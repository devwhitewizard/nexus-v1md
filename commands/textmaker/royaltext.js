const mumaker = require('mumaker');
module.exports = {
  name: 'royaltext',
  aliases: ['royal', 'kingtext'],
  category: 'textmaker',
  description: 'Create royal text effect',
  usage: '.royaltext <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.royaltext Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating royal text effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/royal-text-effect-online-560.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `👑 *ROYAL TEXT EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
