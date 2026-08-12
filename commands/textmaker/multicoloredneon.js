const mumaker = require('mumaker');
module.exports = {
  name: 'multicoloredneon',
  aliases: ['rainbowneon', 'colorneon'],
  category: 'textmaker',
  description: 'Create multicolored neon text effect',
  usage: '.multicoloredneon <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.multicoloredneon Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating multicolored neon effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/multi-colored-neon-sign-effect-online-570.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🌈 *MULTICOLORED NEON EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
