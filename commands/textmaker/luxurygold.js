const mumaker = require('mumaker');
module.exports = {
  name: 'luxurygold',
  aliases: ['gold'],
  category: 'textmaker',
  description: 'Create luxury gold text effect',
  usage: '.luxurygold <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.luxurygold Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating luxury gold effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/luxury-gold-text-effect-online-570.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🥇 *LUXURY GOLD EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
