const mumaker = require('mumaker');

module.exports = {
  name: 'hacker',
  aliases: ['anonymous', 'cyber'],
  category: 'textmaker',
  description: 'Create anonymous hacker neon text effect',
  usage: '.hacker <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.hacker Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating hacker effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `🕵️ *HACKER EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
