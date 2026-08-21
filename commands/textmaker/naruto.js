const { generateTextEffect } = require('../../lib/textmaker');
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
      const imageUrl = await generateTextEffect('naruto', text);
      
      await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `🍥 *NARUTO EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
