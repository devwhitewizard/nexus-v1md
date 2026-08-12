const mumaker = require('mumaker');
module.exports = {
  name: 'textonwetglass',
  aliases: ['wetglass', 'glasstext'],
  category: 'textmaker',
  description: 'Create text on wet glass effect',
  usage: '.textonwetglass <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.textonwetglass Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating wet glass effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/create-text-on-wet-glass-online-544.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🪟 *WET GLASS EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
