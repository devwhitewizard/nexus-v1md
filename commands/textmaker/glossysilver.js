const mumaker = require('mumaker');
module.exports = {
  name: 'glossysilver',
  aliases: ['silver'],
  category: 'textmaker',
  description: 'Create glossy silver text effect',
  usage: '.glossysilver <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.glossysilver Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating glossy silver effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/create-glossy-silver-text-effect-online-552.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🪙 *GLOSSY SILVER EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
