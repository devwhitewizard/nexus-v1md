const mumaker = require('mumaker');
module.exports = {
  name: 'flux',
  aliases: ['fluxtext', 'fluxeffect'],
  category: 'textmaker',
  description: 'Create flux text effect',
  usage: '.flux <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.flux Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating flux effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/flux-text-effect-online-571.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `⚡ *FLUX EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
