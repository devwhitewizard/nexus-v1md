const mumaker = require('mumaker');
module.exports = {
  name: 'devilwings',
  aliases: ['demonwings'],
  category: 'textmaker',
  description: 'Create devil wings text effect',
  usage: '.devilwings <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.devilwings Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating devil wings effect...*' }, { quoted: msg });
      const result = await mumaker.ephoto('https://en.ephoto360.com/devil-wings-text-effect-online-565.html', text);
      if (!result || !result.image) throw new Error('No image received');
      await sock.sendMessage(jid, { image: { url: result.image }, caption: `😈 *DEVIL WINGS EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
