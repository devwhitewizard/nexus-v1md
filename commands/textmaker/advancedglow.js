const mumaker = require('mumaker');
module.exports = {
  name: 'advancedglow',
  aliases: ['aglow'],
  category: 'textmaker',
  description: 'Create advanced glow text effect',
  usage: '.advancedglow <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.advancedglow Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating advanced glow effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/advanced-glow-effects-text-online-617.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `💫 *ADVANCED GLOW EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
