const mumaker = require('mumaker');
module.exports = {
  name: 'summerbeach',
  aliases: ['beach', 'summer'],
  category: 'textmaker',
  description: 'Create summer beach text effect',
  usage: '.summerbeach <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.summerbeach Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating summer beach effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/create-summer-beach-text-effect-online-556.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🏖️ *SUMMER BEACH EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
