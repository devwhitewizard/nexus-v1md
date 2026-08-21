const { generateTextEffect } = require('../../lib/textmaker');
module.exports = {
  name: 'vintagetext',
  aliases: ['vintage', 'retro'],
  category: 'textmaker',
  description: 'Create vintage retro text effect',
  usage: '.vintagetext <text>',
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      if (!text) return await sock.sendMessage(jid, { text: '❌ Example: `.vintagetext Nexus`' }, { quoted: msg });
      await sock.sendMessage(jid, { text: '⏳ *Generating vintage text effect...*' }, { quoted: msg });
      const imageUrl = await generateTextEffect('vintagetext', text);
      
      await sock.sendMessage(jid, { image: { url: imageUrl }, caption: `📻 *VINTAGE TEXT EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ *Error:* ${e.message}` }, { quoted: msg }); }
  }
};
