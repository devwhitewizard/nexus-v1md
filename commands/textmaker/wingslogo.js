const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'wingslogo',
  aliases: [],
  category: 'textmaker',
  description: 'Create wings logo text effect',
  usage: '.wingslogo <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.wingslogo Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating wings logo effect...*' }, { quoted: msg });
      const imageBuffer = await generateTextEffect('wingslogo', text);
      
      await sock.sendMessage(jid, { image: imageBuffer, caption: `🦅 *WINGS LOGO EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
