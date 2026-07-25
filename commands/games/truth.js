const TRUTHS = [
    "What's the most embarrassing thing that's ever happened to you?",
    "Have you ever lied to your best friend? What was it about?",
    "What's the biggest mistake you've ever made?",
    "What's a secret you've never told anyone?",
    "Who in this group do you trust the most and why?",
    "Have you ever cheated on a test or exam?",
    "What's the most childish thing you still do?",
    "What's a bad habit you can't stop?",
    "Have you ever blamed someone else for something you did?",
    "What's the worst gift you've ever received?",
    "Do you have a crush on anyone right now? Describe them.",
    "What's the most money you've ever wasted on something silly?",
    "What's the most embarrassing photo of you that exists?",
    "Have you ever stolen something, even small?",
    "What's one thing you'd change about your personality?",
    "Who do you text most in this group and what do you say?",
    "What's your biggest fear?",
    "What's the weirdest dream you've ever had?",
    "Have you ever pretended to be sick to avoid something?",
    "What's one thing your parents don't know about you?",
    "What's the rudest thing you've ever said to someone?",
    "Have you ever liked someone who was taken?",
    "What's the most embarrassing thing on your phone right now?",
    "What's a talent you secretly wish you had?",
    "What's the longest you've gone without showering?",
    "Have you ever ghosted someone? Who and why?",
    "What's the most awkward date you've ever been on?",
    "Do you talk about people behind their backs?",
    "What's the silliest thing you've ever cried about?",
    "Who was your very first crush?"
];

module.exports = {
    name: "truth",
    aliases: ["truthquestion", "trueq"],
    description: "Get a random truth question for Truth or Dare.",
    category: "games",
    execute: async ({ sock, jid, msg }) => {
        const q = TRUTHS[Math.floor(Math.random() * TRUTHS.length)];
        await sock.sendMessage(jid, {
            text: `🎭 *TRUTH*\n\n❓ ${q}\n\n_Answer honestly... or pick .dare instead!_`
        }, { quoted: msg });
    }
};
