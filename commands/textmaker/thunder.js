const mumaker = require('mumaker');

module.exports = {
  name: 'thunder',
  aliases: ['lightning'],
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
      
      const result = await mumaker.ephoto('https://en.ephoto360.com/thunder-text-effect-online-97.html', text);
      
      if (!result || !result.image) {
        throw new Error('No image URL received from the API');
      }
      
      await sock.sendMessage(jid, {
        image: { url: result.image },
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
