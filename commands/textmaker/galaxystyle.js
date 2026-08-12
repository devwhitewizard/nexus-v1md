const mumaker = require('mumaker');
module.exports = {
  name: 'galaxystyle',
  aliases: ['galaxy', 'space'],
  category: 'textmaker',
  description: 'Create galaxy style text effect',
  usage: '.galaxystyle <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.galaxystyle Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating galaxy style effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/galaxy-style-text-effect-online-539.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🌌 *GALAXY STYLE EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
