const mumaker = require('mumaker');
module.exports = {
  name: 'vintagetext',
  aliases: ['vintage', 'retro'],
  category: 'textmaker',
  description: 'Create vintage retro text effect',
  usage: '.vintagetext <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.vintagetext Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating vintage text effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/vintage-text-effect-online-545.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `📻 *VINTAGE TEXT EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
