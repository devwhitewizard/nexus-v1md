const mumaker = require('mumaker');

module.exports = {
  name: 'matrix',
  aliases: ['code', 'greencode'],
  category: 'textmaker',
  description: 'Create matrix code text effect',
  usage: '.matrix <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.matrix Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating matrix effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/matrix-text-effect-154.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🖥️ *MATRIX EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
