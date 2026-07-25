const mumaker = require('mumaker');

module.exports = {
  name: 'ice',
  aliases: ['frost', 'frozen'],
  category: 'textmaker',
  description: 'Create ice text effect',
  usage: '.ice <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.ice Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating ice effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/ice-text-effect-online-101.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🧊 *ICE EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
