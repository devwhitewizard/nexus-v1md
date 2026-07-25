const mumaker = require('mumaker');

module.exports = {
  name: '1917',
  aliases: [],
  category: 'textmaker',
  description: 'Create 1917 style text effect',
  usage: '.1917 <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.1917 Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating 1917 effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/1917-style-text-effect-523.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🎬 *1917 EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
