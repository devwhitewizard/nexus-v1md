const { generateTextEffect } = require('../../lib/textmaker');

module.exports = {
  name: 'purple',
  aliases: [],
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
      
      const imageBuffer = await generateTextEffect('purple', text);
      
      await sock.sendMessage(jid, {
        image: imageBuffer,
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
