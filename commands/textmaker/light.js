const mumaker = require('mumaker');

module.exports = {
  name: 'light',
  aliases: ['futuristic'],
  category: 'textmaker',
  description: 'Create futuristic light text effect',
  usage: '.light <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.light Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating light effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `💡 *LIGHT EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
