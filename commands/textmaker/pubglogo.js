const mumaker = require('mumaker');
module.exports = {
  name: 'pubglogo',
  aliases: ['pubg', 'pubgtext'],
  category: 'textmaker',
  description: 'Create PUBG style logo text effect',
  usage: '.pubglogo <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.pubglogo Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating PUBG logo effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/pubg-logo-text-effect-online-525.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🎮 *PUBG LOGO EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
