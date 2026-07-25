const mumaker = require('mumaker');

module.exports = {
  name: 'blackpink',
  aliases: ['bp'],
  category: 'textmaker',
  description: 'Create blackpink style text effect',
  usage: '.blackpink <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.blackpink Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating blackpink effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🖤💗 *BLACKPINK EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
