const mumaker = require('mumaker');
module.exports = {
  name: 'naruto',
  aliases: ['narutotext', 'ninja'],
  category: 'textmaker',
  description: 'Create Naruto style text effect',
  usage: '.naruto <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.naruto Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating Naruto effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/naruto-text-effect-online-518.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🍥 *NARUTO EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
