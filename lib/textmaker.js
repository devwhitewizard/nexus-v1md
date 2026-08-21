const mumaker = require('mumaker');

// Mapping of effect keywords / ephoto URLs to working Textpro endpoints
const TEXTPRO_MAP = {
    // Neon & Glow
    glow: 'https://textpro.me/create-glowing-neon-light-text-effect-online-1061.html',
    neon: 'https://textpro.me/create-glowing-neon-light-text-effect-online-1061.html',
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
    hacker: 'https://textpro.me/matrix-style-text-effect-online-884.html',
    matrix: 'https://textpro.me/matrix-style-text-effect-online-884.html',
    flux: 'https://textpro.me/create-a-futuristic-technology-text-effect-online-1011.html',

    // Nature & Elements
    sand: 'https://textpro.me/create-a-summery-sand-writing-text-effect-1027.html',
    summerbeach: 'https://textpro.me/create-a-summery-sand-writing-text-effect-1027.html',
    fire: 'https://textpro.me/create-firework-sparkle-text-effect-online-989.html',
    thunder: 'https://textpro.me/create-thunder-text-effect-online-881.html',
    snow: 'https://textpro.me/create-snow-text-effect-online-1014.html',
    ice: 'https://textpro.me/create-ice-cold-text-effect-online-990.html',
    leaves: 'https://textpro.me/create-green-leaves-text-effect-online-1021.html',
    effectclouds: 'https://textpro.me/create-a-cloud-text-effect-on-the-sky-online-1004.html',
    underwater: 'https://textpro.me/3d-underwater-text-effect-online-982.html',
    textonwetglass: 'https://textpro.me/write-text-on-wet-glass-online-1045.html',

    // Metal & Gold
    metallic: 'https://textpro.me/create-a-metallic-text-effect-online-1049.html',
    luxurygold: 'https://textpro.me/3d-luxury-gold-text-effect-online-1003.html',
    glossysilver: 'https://textpro.me/create-glossy-silver-3d-text-effect-online-1002.html',
    
    // Anime, Gaming & Logos
    blackpink: 'https://textpro.me/create-blackpink-logo-style-online-1001.html',
    blackpinkstyle: 'https://textpro.me/create-blackpink-logo-style-online-1001.html',
    naruto: 'https://textpro.me/create-naruto-logo-style-text-effect-online-1125.html',
    dragonball: 'https://textpro.me/create-dragon-ball-text-effect-online-1100.html',
    pubglogo: 'https://textpro.me/pubg-logo-maker-online-1000.html',
    wolfgalaxy: 'https://textpro.me/create-wolf-logo-black-white-online-937.html',
    wingslogo: 'https://textpro.me/create-neon-devil-wings-text-effect-online-1083.html',
    devil: 'https://textpro.me/create-neon-devil-wings-text-effect-online-1083.html',
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
    arting: 'https://textpro.me/create-arting-text-effect-online-1122.html',
    corntext: 'https://textpro.me/create-3d-deep-sea-metal-text-effect-online-1053.html'
};

const DEFAULT_TEXTPRO = 'https://textpro.me/create-glowing-neon-light-text-effect-online-1061.html';

const generateTextEffect = async (urlOrKey, text) => {
    if (!text || typeof text !== 'string') {
        throw new Error('Please provide text to generate.');
    }

    let textproUrl = null;
    for (const [key, tUrl] of Object.entries(TEXTPRO_MAP)) {
        if (urlOrKey.toLowerCase().includes(key)) {
            textproUrl = tUrl;
            break;
        }
    }

    if (!textproUrl) {
        textproUrl = urlOrKey.includes('textpro.me') ? urlOrKey : DEFAULT_TEXTPRO;
    }

    try {
        const result = await mumaker.textpro(textproUrl, text);
        if (result && result.status && result.image) {
            return result.image;
        }
        throw new Error('No image URL generated');
    } catch (err) {
        try {
            const fallbackResult = await mumaker.textpro(DEFAULT_TEXTPRO, text);
            if (fallbackResult && fallbackResult.status && fallbackResult.image) {
                return fallbackResult.image;
            }
        } catch (_) {}
        throw new Error('Failed to generate text effect. Service temporary unavailable.');
    }
};

module.exports = { generateTextEffect };
