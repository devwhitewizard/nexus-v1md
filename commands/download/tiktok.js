/**
 * tiktok.js — TikTok Video, Image & Carousel Downloader
 * Aliases: .tiktok, .tt, .tk, .tikdown, .tdown
 * 
 * Supports: Videos (no watermark), Single Images, Photo Carousels
 */

const axios = require('axios');

// ─── Config ──────────────────────────────────────────────────────────────

const OXBOT_API_KEY = process.env.OXBOT_API_KEY || '';
const OXBOT_API_URL = 'https://lecay.oxbot.name.ng/api/download.php';
const OXBOT_STREAM_URL = 'https://lecay.oxbot.name.ng/api/stream.php';

const TIKTOK_REGEX = /https?:\/\/(vm|vt|m|www)?\.?tiktok\.com\//i;

function isValidTikTokUrl(url) {
    return TIKTOK_REGEX.test(url);
}

// ═══════════════════════════════════════════════════════════════
// IMAGE DOWNLOADER (Direct URL download for images)
// ═══════════════════════════════════════════════════════════════

async function downloadImageBuffer(imageUrl) {
    console.log('[TT] Downloading image:', imageUrl.substring(0, 80) + '...');
    
    let response;
    try {
        response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 60000,
            maxContentLength: 50 * 1024 * 1024,
            validateStatus: (status) => status < 500,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Referer': 'https://www.tiktok.com/',
            },
        });
    } catch (err) {
        throw new Error(`Image download failed: ${err.code || err.message}`);
    }

    if (response.status >= 400) {
        throw new Error(`Image server returned HTTP ${response.status}`);
    }

    const buf = Buffer.from(response.data);
    if (buf.length < 1000) {
        throw new Error(`Image too small (${buf.length} bytes), likely an error`);
    }

    console.log(`[TT] ✓ Image downloaded: ${(buf.length / 1024).toFixed(1)} KB`);
    return buf;
}

// ═══════════════════════════════════════════════════════════════
// VIDEO DOWNLOADER (Via stream.php using yt-dlp)
// ═══════════════════════════════════════════════════════════════

async function downloadVideoBuffer(originalTikTokUrl, videoTitle) {
    const safeFilename = (videoTitle || 'tiktok_video').replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 50);
    const streamUrl = `${OXBOT_STREAM_URL}?api_key=${OXBOT_API_KEY}&video_url=${encodeURIComponent(originalTikTokUrl)}&filename=${encodeURIComponent(safeFilename)}`;
    
    console.log('[TT] Requesting yt-dlp proxy from stream.php...');

    let response;
    try {
        response = await axios.get(streamUrl, {
            responseType: 'arraybuffer',
            timeout: 180000,
            maxContentLength: 150 * 1024 * 1024,
            validateStatus: () => true,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': '*/*',
            },
        });
    } catch (err) {
        throw new Error(`Network error: ${err.code || err.message}`);
    }

    const buf = Buffer.from(response.data);
    const contentType = response.headers['content-type'] || '';
    
    console.log(`[TT] stream.php replied: Status=${response.status}, Type=${contentType}, Size=${buf.length} bytes`);

    if (response.status >= 400) {
        let errorMsg = `HTTP ${response.status}`;
        try {
            const errObj = JSON.parse(buf.toString('utf-8'));
            errorMsg = errObj.error || errorMsg;
        } catch {}
        throw new Error(`Proxy error: ${errorMsg}`);
    }

    if (contentType.includes('application/json')) {
        const errorText = buf.toString('utf-8');
        try {
            const errorObj = JSON.parse(errorText);
            throw new Error(errorObj.error || 'Unexpected API response');
        } catch (e) {
            if (e.message !== errorText) throw e;
            throw new Error('Unexpected JSON response from proxy');
        }
    }

    if (buf.length < 10000) {
        throw new Error(`Response too small (${buf.length} bytes). Not a valid video.`);
    }

    console.log(`[TT] ✓ Valid video buffer: ${(buf.length / 1024 / 1024).toFixed(2)} MB`);
    return buf;
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXECUTE
// ═══════════════════════════════════════════════════════════════

module.exports = {
    name: 'tiktok',
    aliases: ['tt', 'tk', 'tikdown', 'tdown'],
    description: 'Download TikTok videos, single images, or photo carousels',
    category: 'download',
    cooldown: 10000,
    async execute({ sock, jid, args, msg }) {
        if (!args || args.length === 0) {
            return await sock.sendMessage(jid, {
                text: "*📱 TIKTOK DOWNLOADER*\n\n*.tiktok <link>* — Download video or images\n\n*Supports:*\n• Videos (no watermark)\n• Single images\n• Photo carousels (all images)\n\n*Aliases:* .tt  .tk  .tikdown  .tdown"
            }, { quoted: msg });
        }

        const url = args[0].trim();
        if (!isValidTikTokUrl(url)) {
            return await sock.sendMessage(jid, { text: "❌ *Invalid TikTok link.* Please enter a valid TikTok URL." }, { quoted: msg });
        }

        try { await sock.sendPresenceUpdate('composing', jid); } catch {}
        try { await sock.sendMessage(jid, { react: { text: '⬇️', key: msg.key } }); } catch {}

        // 1. Get media info from OxBot API
        let result;
        try {
            const apiRes = await axios.get(OXBOT_API_URL, {
                params: { api_key: OXBOT_API_KEY, url },
                timeout: 30000,
            });
            result = apiRes.data;
            
            if (!result || !result.ok) throw new Error(result?.error || 'OxBot API error');
        } catch (err) {
            console.warn('[TT] OxBot API Error:', err.message, 'Trying mediaApi fallback...');
            const mediaApi = require('../../lib/mediaApi');
            const fallbackRes = await mediaApi.tiktokDownload(url);
            if (fallbackRes && fallbackRes.buffer) {
                await sock.sendMessage(jid, {
                    video: fallbackRes.buffer,
                    mimetype: 'video/mp4',
                    caption: `🎬 *${fallbackRes.title || 'TikTok Video'}*\n\n_Nexus-MD Downloader_`
                }, { quoted: msg });
                try { await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } }); } catch {}
                return;
            }
            try { await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } }); } catch {}
            return await sock.sendMessage(jid, { text: `❌ *Failed to download TikTok media:* ${err.message}` }, { quoted: msg });
        }

        const title = result.title || 'TikTok Media';
        const type = result.type || 'video'; // 'video' | 'image' | 'carousel'

        // ═══════════════════════════════════════════════════════════
        // HANDLE IMAGES / CAROUSELS
        // ═══════════════════════════════════════════════════════════
        if (type === 'image' || type === 'carousel') {
            const images = result.images || [result.download_url];
            let successCount = 0;
            let failCount = 0;

            for (let i = 0; i < images.length; i++) {
                const imgUrl = images[i];
                
                try {
                    const imgBuf = await downloadImageBuffer(imgUrl);
                    const imgCaption = images.length > 1
                        ? `📷 *${title}*\n\n_IMAGE ${i + 1} OF ${images.length}_\n\n_Nexus-MD Downloader_`
                        : `📷 *${title}*\n\n_Nexus-MD Downloader_`;

                    await sock.sendMessage(jid, {
                        image: imgBuf,
                        caption: imgCaption,
                    }, { quoted: i === 0 ? msg : undefined });

                    successCount++;
                    if (i < images.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                } catch (imgErr) {
                    console.error(`[TT] Failed image ${i + 1}:`, imgErr.message);
                    failCount++;
                }
            }

            if (successCount > 0) {
                try { await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } }); } catch {}
                if (failCount > 0) {
                    await sock.sendMessage(jid, { text: `⚠️ Downloaded ${successCount}/${images.length} images. ${failCount} failed.` }, { quoted: msg });
                }
            } else {
                try { await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } }); } catch {}
                await sock.sendMessage(jid, { text: `❌ *Failed to download images:* All ${images.length} image(s) failed.` }, { quoted: msg });
            }
            return;
        }

        // ═══════════════════════════════════════════════════════════
        // HANDLE VIDEOS
        // ═══════════════════════════════════════════════════════════
        const caption = `🎵 *${title}*\n\n_Nexus-MD Downloader_`;

        try {
            const buf = await downloadVideoBuffer(url, title);
            
            await sock.sendMessage(jid, {
                video: buf,
                mimetype: 'video/mp4',
                caption,
            }, { quoted: msg });

            try { await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } }); } catch {}
        } catch (err) {
            console.error('[TT] Video Download Error:', err.message);
            try { await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } }); } catch {}
            await sock.sendMessage(jid, { text: `❌ *Failed to download video:* _${err.message}_` }, { quoted: msg });
        }
    }
};
