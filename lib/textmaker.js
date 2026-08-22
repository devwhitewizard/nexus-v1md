const mumaker = require('mumaker');
const axios = require('axios');

// Mapping of effect keywords to unique, working Textpro endpoints
const TEXTPRO_MAP = {
    // Neon & Glow
    neon: 'https://textpro.me/create-a-neon-light-text-effect-online-1060.html',
    glowingtext: 'https://textpro.me/create-a-glowing-neon-light-text-effect-online-1061.html',
    makingneon: 'https://textpro.me/create-neon-light-on-brick-wall-online-1062.html',
    multicoloredneon: 'https://textpro.me/create-multicolored-neon-light-on-brick-wall-online-1063.html',
    purple: 'https://textpro.me/create-purple-glowing-neon-text-effect-online-1082.html',
    advancedglow: 'https://textpro.me/create-advanced-glow-text-effect-online-1138.html',
    royaltext: 'https://textpro.me/create-royal-glowing-text-effect-online-1085.html',
    light: 'https://textpro.me/create-light-glow-text-effect-online-1084.html',
    
    // Glitch & Tech
    glitch: 'https://textpro.me/create-glitch-text-effect-style-online-999.html',
    pixelglitch: 'https://textpro.me/create-pixel-glitch-text-effect-online-1048.html',
    impressive: 'https://textpro.me/create-impressive-glitch-text-effect-online-1024.html',
    hacker: 'https://textpro.me/create-anonymous-hacker-text-effect-online-1044.html',
    matrix: 'https://textpro.me/matrix-style-text-effect-online-884.html',
    flux: 'https://textpro.me/create-a-futuristic-technology-text-effect-online-1011.html',

    // Nature & Elements
    sand: 'https://textpro.me/create-a-summery-sand-writing-text-effect-1027.html',
    summerbeach: 'https://textpro.me/create-a-beach-text-effect-online-983.html',
    fire: 'https://textpro.me/create-a-fire-text-effect-online-991.html',
    thunder: 'https://textpro.me/create-thunder-text-effect-online-881.html',
    snow: 'https://textpro.me/create-snow-text-effect-online-1014.html',
    ice: 'https://textpro.me/create-ice-cold-text-effect-online-990.html',
    leaves: 'https://textpro.me/natural-leaves-text-effect-931.html',
    effectclouds: 'https://textpro.me/create-a-cloud-text-effect-on-the-sky-online-1004.html',
    underwater: 'https://textpro.me/3d-underwater-text-effect-online-982.html',
    textonwetglass: 'https://textpro.me/write-text-on-wet-glass-online-1045.html',

    // Metal & Gold
    metallic: 'https://textpro.me/create-a-metallic-text-effect-online-1049.html',
    luxurygold: 'https://textpro.me/3d-luxury-gold-text-effect-online-1003.html',
    glossysilver: 'https://textpro.me/create-glossy-silver-3d-text-effect-online-1002.html',
    corntext: 'https://textpro.me/create-a-3d-orange-juice-text-effect-online-1056.html',
    
    // Anime, Gaming & Logos
    blackpink: 'https://textpro.me/create-blackpink-logo-style-online-1001.html',
    blackpinkstyle: 'https://textpro.me/online-blackpink-style-text-effect-generator-1071.html',
    naruto: 'https://textpro.me/create-naruto-logo-style-text-effect-online-1125.html',
    dragonball: 'https://textpro.me/create-dragon-ball-text-effect-online-1100.html',
    pubglogo: 'https://textpro.me/pubg-logo-maker-online-1000.html',
    wolfgalaxy: 'https://textpro.me/create-wolf-logo-black-white-online-937.html',
    wingslogo: 'https://textpro.me/create-a-dragon-logo-online-935.html',
    devil: 'https://textpro.me/create-demon-fire-text-effect-online-1075.html',
    devilwings: 'https://textpro.me/create-neon-devil-wings-text-effect-online-1083.html',
    deadpool: 'https://textpro.me/create-deadpool-text-effect-online-1092.html',

    // Styles & Vintage
    "1917": 'https://textpro.me/1917-style-text-effect-online-1023.html',
    vintagetext: 'https://textpro.me/create-a-vintage-text-effect-online-1012.html',
    cartoonstyle: 'https://textpro.me/create-3d-cartoon-text-effect-online-1079.html',
    comic: 'https://textpro.me/create-3d-comic-text-effect-online-1091.html',
    painttext: 'https://textpro.me/create-3d-paint-text-effect-online-1090.html',
    typography: 'https://textpro.me/create-typography-text-effect-online-1110.html',
    galaxystyle: 'https://textpro.me/create-galaxy-style-free-name-logo-online-997.html',
    galaxywallpaper: 'https://textpro.me/create-space-3d-text-effect-online-985.html',
    flagtext: 'https://textpro.me/create-american-flag-3d-text-effect-online-1051.html',
    arena: 'https://textpro.me/create-arena-text-effect-online-1111.html',
    arting: 'https://textpro.me/create-arting-text-effect-online-1122.html'
};

const DEFAULT_TEXTPRO = 'https://textpro.me/create-glowing-neon-light-text-effect-online-1061.html';

/**
 * Download an image URL as a Buffer with browser-like headers to bypass hotlink protection.
 * @param {string} url
 * @returns {Promise<Buffer>}
 */
const fetchImageBuffer = async (url) => {
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 20000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Referer': 'https://textpro.me/',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        }
    });
    return Buffer.from(response.data);
};

const generateTextEffect = async (urlOrKey, text) => {
    if (!text || typeof text !== 'string') {
        throw new Error('Please provide text to generate.');
    }

    const key = urlOrKey.toLowerCase().trim();
    let textproUrl = TEXTPRO_MAP[key];

    if (!textproUrl) {
        textproUrl = key.includes('textpro.me') ? key : DEFAULT_TEXTPRO;
    }

    // Try single-text first, then multi-text for endpoints expecting 2 inputs (e.g. deadpool, comic, etc.)
    const attempts = [
        text,
        [text, text],
        [text, 'Nexus']
    ];

    for (const inputParam of attempts) {
        try {
            const result = await mumaker.textpro(textproUrl, inputParam);
            if (result && result.status && result.image) {
                const buffer = await fetchImageBuffer(result.image);
                return buffer;
            }
        } catch (err) {
            // try next input format
        }
    }

    throw new Error('Failed to generate text effect. Service temporary unavailable.');
};

module.exports = { generateTextEffect, fetchImageBuffer };
