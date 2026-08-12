const mumaker = require('mumaker');
module.exports = {
  name: 'corntext',
  aliases: ['corn', 'cornlogo'],
  category: 'textmaker',
  description: 'Create corn style text effect',
  usage: '.corntext <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.corntext Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating corn text effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/create-3d-corn-text-effect-online-566.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🌽 *CORN TEXT EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
