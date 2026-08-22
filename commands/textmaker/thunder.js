const { generateTextEffect } = require('../../lib/textmaker');

module.exports = {
  name: 'thunder',
  aliases: [],
  category: 'textmaker',
  description: 'Create thunder text effect',
  usage: '.thunder <text>',
  
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      
      if (!text) {
        return await sock.sendMessage(jid, { 
          text: '❌ Please provide text to generate\nExample: `.thunder Nexus`' 
        }, { quoted: msg });
      }

      await sock.sendMessage(jid, { text: "⏳ *Generating your thunder effect...* Please wait." }, { quoted: msg });
      
      const imageBuffer = await generateTextEffect('thunder', text);
      
      await sock.sendMessage(jid, {
        image: imageBuffer,
        caption: `✨ *THUNDER EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*`
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Error in thunder command:', error);
      await sock.sendMessage(jid, { 
        text: `❌ *Error:* ${error.message}` 
      }, { quoted: msg });
    }
  }
};
