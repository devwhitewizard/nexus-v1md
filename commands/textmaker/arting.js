const mumaker = require('mumaker');
module.exports = {
  name: 'arting',
  aliases: ['art', 'arttext'],
  category: 'textmaker',
  description: 'Create artistic text effect',
  usage: '.arting <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.arting Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating arting effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/arting-text-effect-online-573.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🎭 *ARTING EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
