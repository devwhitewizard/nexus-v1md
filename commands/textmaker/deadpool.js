const mumaker = require('mumaker');
module.exports = {
  name: 'deadpool',
  aliases: ['dpt', 'deadpooltext'],
  category: 'textmaker',
  description: 'Create Deadpool style text effect',
  usage: '.deadpool <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.deadpool Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating Deadpool effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/deadpool-text-effect-online-519.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🔴 *DEADPOOL EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
