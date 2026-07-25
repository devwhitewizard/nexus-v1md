const mumaker = require('mumaker');

module.exports = {
  name: 'leaves',
  aliases: ['nature', 'green'],
  category: 'textmaker',
  description: 'Create green brush leaves text effect',
  usage: '.leaves <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.leaves Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating leaves effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/green-brush-text-effect-typography-maker-online-153.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🍃 *LEAVES EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
