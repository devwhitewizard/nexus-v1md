const DARES = [
    "Send a voice note singing your favourite song for 15 seconds.",
    "Change your profile picture to whatever the group decides for 1 hour.",
    "Text your crush RIGHT NOW and say 'hey'.",
    "Do your best celebrity impression in a voice note.",
    "Send the 5th photo in your gallery right now.",
    "Type a message using only your nose and send it.",
    "Call a friend and speak in a different accent for the whole call.",
    "Post a goofy selfie in your WhatsApp status for 30 minutes.",
    "Do 20 push-ups and send a video proof.",
    "Send a voice note saying 'I love broccoli' in the most dramatic voice possible.",
    "Text someone you haven't talked to in 6 months.",
    "Send a photo of the inside of your fridge right now.",
    "Say the alphabet backwards as fast as you can in a voice note.",
    "Let the group choose your next profile name for 1 hour.",
    "Write a short poem about the person on your left and send it.",
    "Send every contact in your top-5 a red heart emoji with no explanation.",
    "Do your best impression of a famous TV character in a voice note.",
    "Hold your breath for as long as possible and time it.",
    "Describe yourself in 3 emojis only and let the group guess who.",
    "Send a motivational quote to your family group chat.",
    "Change your WhatsApp last seen to 'Always' for 1 hour.",
    "Speak only in questions for the next 5 minutes in this chat.",
    "Send a voice note with the worst joke you know.",
    "Share your screen time report screenshot.",
    "Eat a spoonful of hot sauce, take a photo/video.",
    "Let the group write your next WhatsApp status update.",
    "Do a dramatic reading of the last message you sent in another group.",
    "Send a voice note humming a song and let the group guess it.",
    "Set a silly alarm label that the group picks for today.",
    "Roast yourself in exactly 3 sentences."
];

module.exports = {
    name: "dare",
    aliases: ["dared", "dareq"],
    description: "Get a random dare for Truth or Dare.",
    category: "games",
    execute: async ({ sock, jid, msg }) => {
        const d = DARES[Math.floor(Math.random() * DARES.length)];
        await sock.sendMessage(jid, {
            text: `🔥 *DARE*\n\n🎯 ${d}\n\n_Complete it or pick .truth instead!_`
        }, { quoted: msg });
    }
};
