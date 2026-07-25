const PICKUPS = [
    "Are you a magician? Because whenever I look at you, everyone else disappears. ✨",
    "Do you have a map? I keep getting lost in your eyes. 🗺️",
    "Is your name Google? Because you have everything I've been searching for. 🔍",
    "Are you a parking ticket? Because you've got 'fine' written all over you. 😏",
    "Do you believe in love at first text? Or should I message you again? 💬",
    "Is your WiFi name 'Neighbours'? Because I feel a connection. 📶",
    "Are you a campfire? Because you're hot and I want s'more. 🔥",
    "If you were a vegetable, you'd be a cute-cumber. 🥒",
    "Are you a bank loan? Because you've got my interest. 📈",
    "Do you like science? Because we've got great chemistry. ⚗️",
    "Your hand looks heavy — can I hold it for you? 🤝",
    "If you were a triangle, you'd be acute one. 📐",
    "Are you a time traveller? Because I see you in my future. ⏳",
    "Are you a keyboard? Because you're just my type. ⌨️",
    "Is your name WiFi? Because I'm feeling a real connection here. 📡",
    "You must be a 90-degree angle — because you're looking right! 📏",
    "If looks could kill, you'd be a weapon of mass destruction. 💣",
    "Are you from Kenya? Because Nairobody is like you. 🇰🇪😄",
    "I must be a snowflake, because I've fallen for you. ❄️",
    "Are you a star? Because your beauty lights up the room. ⭐",
    "Is your dad an artist? Because you're a masterpiece. 🎨",
    "Do you have a name, or can I call you mine? 😊",
    "You must be made of copper and tellurium, because you're CuTe. ⚛️",
    "If you were a fruit, you'd be a fine-apple. 🍍",
    "Are you a dictionary? Because you add meaning to my life. 📖",
];

module.exports = {
    name: "pickup",
    aliases: ["pickupline", "flirt", "rizz"],
    description: "Get a random pickup line.",
    category: "fun",
    execute: async ({ sock, jid, msg }) => {
        const line = PICKUPS[Math.floor(Math.random() * PICKUPS.length)];
        await sock.sendMessage(jid, {
            text: `😍 *PICKUP LINE*\n\n💌 _"${line}"_\n\n_Rizz powered by Nexus-1MD 🔥_`
        }, { quoted: msg });
    }
};
