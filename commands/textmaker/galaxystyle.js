const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'galaxystyle',
  aliases: [],
  category: 'textmaker',
  description: 'Create galaxy style text effect',
  usage: '.galaxystyle <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.galaxystyle Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating galaxy style effect...*' }, { quoted: msg });
      const imageBuffer = await generateTextEffect('galaxystyle', text);
      
      await sock.sendMessage(jid, { image: imageBuffer, caption: `🌌 *GALAXY STYLE EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
