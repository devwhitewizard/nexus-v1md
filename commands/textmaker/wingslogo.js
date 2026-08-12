const mumaker = require('mumaker');
module.exports = {
  name: 'wingslogo',
  aliases: ['wings', 'wingstext'],
  category: 'textmaker',
  description: 'Create wings logo text effect',
  usage: '.wingslogo <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.wingslogo Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating wings logo effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/create-wings-logo-text-effect-online-562.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🦅 *WINGS LOGO EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
