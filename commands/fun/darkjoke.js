const DARK_JOKES = [
    "I told my doctor I broke my arm in two places. He told me to stop going to those places.",
    "My wife told me I had to stop acting like a flamingo. I had to put my foot down.",
    "I asked my dog what 2 minus 2 is. He said nothing.",
    "I have a joke about construction, but I'm still working on it.",
    "Why don't graveyards ever get overcrowded? Because people are dying to get in.",
    "I wasn't close to my father when he died... which is lucky, because he stepped on a landmine.",
    "My grandfather died peacefully in his sleep. Not like the passengers in his car at the time.",
    "I bought some shoes from a drug dealer. I don't know what he laced them with, but I was tripping all day.",
    "Why did the blind man fall into the well? Because he couldn't see that well.",
    "I told a joke about a pencil. It was pointless.",
    "I have a joke about a wall. I'm still building it.",
    "My therapist told me I have trouble accepting things I can't control. We'll see about that.",
    "People say I'm condescending. That means I talk down to people.",
    "Why did the scarecrow win an award? Because he was outstanding in his field. His colleagues were not.",
    "I used to hate facial hair, but then it grew on me.",
    "Never trust an atom. They make up everything.",
    "I asked the librarian if they had books about paranoia. She whispered, 'They're right behind you.'",
    "Why don't scientists trust atoms? I heard they were involved in the Big Bang.",
    "I started a business selling yachts from my garage. Sales are going swimmingly.",
    "My wife said I needed to grow up. I told her to get out of my fort.",
];

module.exports = {
    name: "darkjoke",
    aliases: ["dark", "darkhumor", "darkhumour"],
    description: "Dark humor — use responsibly!",
    category: "fun",
    execute: async ({ sock, jid, msg }) => {
        const joke = DARK_JOKES[Math.floor(Math.random() * DARK_JOKES.length)];
        await sock.sendMessage(jid, {
            text:
                `💀 *DARK HUMOR*\n` +
                `⚠️ _Viewer discretion advised_\n\n` +
                `😈 ${joke}\n\n` +
                `_Nexus-1MD Dark Edition_`
        }, { quoted: msg });
    }
};
