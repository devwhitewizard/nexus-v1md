const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'deadpool',
  aliases: [],
  category: 'textmaker',
  description: 'Create Deadpool style text effect',
  usage: '.deadpool <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.deadpool Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating Deadpool effect...*' }, { quoted: msg });
      const imageBuffer = await generateTextEffect('deadpool', text);
      
      await sock.sendMessage(jid, { image: imageBuffer, caption: `🔴 *DEADPOOL EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
