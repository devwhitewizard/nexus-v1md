const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'devilwings',
  aliases: [],
  category: 'textmaker',
  description: 'Create devil wings text effect',
  usage: '.devilwings <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.devilwings Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating devil wings effect...*' }, { quoted: msg });
      const imageBuffer = await generateTextEffect('devilwings', text);
      
      await sock.sendMessage(jid, { image: imageBuffer, caption: `😈 *DEVIL WINGS EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
