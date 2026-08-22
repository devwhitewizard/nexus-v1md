const { generateTextEffect } = require('../../lib/textmaker');

module.exports = {
  name: 'sand',
  aliases: [],
  category: 'textmaker',
  description: 'Create sand text effect',
  usage: '.sand <text>',
  
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      
      if (!text) {
        return await sock.sendMessage(jid, { 
          text: '❌ Please provide text to generate\nExample: `.sand Nexus`' 
        }, { quoted: msg });
      }

      await sock.sendMessage(jid, { text: "⏳ *Generating your sand effect...* Please wait." }, { quoted: msg });
      
      const imageBuffer = await generateTextEffect('sand', text);
      
      await sock.sendMessage(jid, {
        image: imageBuffer,
        caption: `🏖️ *SAND EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*`
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Error in sand command:', error);
      await sock.sendMessage(jid, { 
        text: `❌ *Error:* ${error.message}` 
      }, { quoted: msg });
    }
  }
};
