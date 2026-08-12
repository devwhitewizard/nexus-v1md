const mumaker = require('mumaker');
module.exports = {
  name: 'wolfgalaxy',
  aliases: ['wolf', 'wolftext'],
  category: 'textmaker',
  description: 'Create wolf galaxy text effect',
  usage: '.wolfgalaxy <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.wolfgalaxy Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating wolf galaxy effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/wolf-galaxy-text-effect-online-543.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🐺 *WOLF GALAXY EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
