const mumaker = require('mumaker');
module.exports = {
  name: 'flagtext',
  aliases: ['flag', 'flaglogo'],
  category: 'textmaker',
  description: 'Create flag text effect',
  usage: '.flagtext <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.flagtext Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating flag text effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/create-flag-text-effect-online-561.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🚩 *FLAG TEXT EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
