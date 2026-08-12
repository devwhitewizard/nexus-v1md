const mumaker = require('mumaker');
module.exports = {
  name: 'underwater',
  aliases: ['aqua', 'ocean'],
  category: 'textmaker',
  description: 'Create underwater text effect',
  usage: '.underwater <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.underwater Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating underwater effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/underwater-text-effect-online-588.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🌊 *UNDERWATER EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
