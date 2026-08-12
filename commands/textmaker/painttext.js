const mumaker = require('mumaker');
module.exports = {
  name: 'painttext',
  aliases: ['paint', 'brushtext'],
  category: 'textmaker',
  description: 'Create paint brush text effect',
  usage: '.painttext <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.painttext Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating paint text effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/paint-text-effect-online-514.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🎨 *PAINT TEXT EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
