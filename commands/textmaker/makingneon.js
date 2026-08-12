const mumaker = require('mumaker');
module.exports = {
  name: 'makingneon',
  aliases: ['makeneon', 'neonmaking'],
  category: 'textmaker',
  description: 'Create neon making text effect',
  usage: '.makingneon <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.makingneon Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating making neon effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/making-a-neon-sign-text-effect-online-564.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `💡 *MAKING NEON EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
