const mumaker = require('mumaker');

module.exports = {
  name: 'metallic',
  aliases: ['metal', 'chrome'],
  category: 'textmaker',
  description: 'Create decorative 3D metallic text effect',
  usage: '.metallic <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.metallic Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating metallic effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/impressive-decorative-3d-metal-text-effect-798.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `⚙️ *METALLIC EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
