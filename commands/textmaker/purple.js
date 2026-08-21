const { generateTextEffect } = require('../../lib/textmaker');

module.exports = {
  name: 'purple',
  aliases: ['violet', 'glow'],
  category: 'textmaker',
  description: 'Create purple text effect',
  usage: '.purple <text>',
  
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      
      if (!text) {
        return await sock.sendMessage(jid, { 
          text: '❌ Please provide text to generate\nExample: `.purple Nexus`' 
        }, { quoted: msg });
      }

      await sock.sendMessage(jid, { text: "⏳ *Generating your purple effect...* Please wait." }, { quoted: msg });
      
      const imageUrl = await generateTextEffect('purple', text);
      
      if (!result || !result.image) {
        throw new Error('No image URL received from the API');
      }
      
      await sock.sendMessage(jid, {
        image: { url: imageUrl },
        caption: `🔮 *PURPLE GLOW EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*`
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Error in purple command:', error);
      await sock.sendMessage(jid, { 
        text: `❌ *Error:* ${error.message}` 
      }, { quoted: msg });
    }
  }
};
