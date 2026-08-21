const { generateTextEffect } = require('../../lib/textmaker');

module.exports = {
  name: 'snow',
  aliases: ['ice', 'winter'],
  category: 'textmaker',
  description: 'Create snow 3D text effect',
  usage: '.snow <text>',
  
  async execute({ sock, jid, args, msg }) {
    try {
      const text = args.join(' ');
      
      if (!text) {
        return await sock.sendMessage(jid, { 
          text: '❌ Please provide text to generate\nExample: `.snow Nexus`' 
        }, { quoted: msg });
      }

      await sock.sendMessage(jid, { text: "⏳ *Generating your snow effect...* Please wait." }, { quoted: msg });
      
      const imageUrl = await generateTextEffect('snow', text);
      
      if (!result || !result.image) {
        throw new Error('No image URL received from the API');
      }
      
      await sock.sendMessage(jid, {
        image: { url: imageUrl },
        caption: `❄️ *SNOW EFFECT*\n\n💎 *Text:* ${text}\n🛡️ *Powered by Nexus-1MD*`
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Error in snow command:', error);
      await sock.sendMessage(jid, { 
        text: `❌ *Error:* ${error.message}` 
      }, { quoted: msg });
    }
  }
};
