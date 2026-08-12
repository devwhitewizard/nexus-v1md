const mumaker = require('mumaker');
module.exports = {
  name: 'comic',
  aliases: ['comictext', 'comicbook'],
  category: 'textmaker',
  description: 'Create comic book text effect',
  usage: '.comic <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.comic Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating comic text effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/comic-book-text-effect-online-549.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `💥 *COMIC TEXT EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
