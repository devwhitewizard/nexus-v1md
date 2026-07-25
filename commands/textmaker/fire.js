const mumaker = require('mumaker');

module.exports = {
  name: 'fire',
  aliases: ['flame'],
  category: 'textmaker',
  description: 'Create fire flame text effect',
  usage: '.fire <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.fire Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating fire effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/flame-lettering-effect-372.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🔥 *FIRE EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
