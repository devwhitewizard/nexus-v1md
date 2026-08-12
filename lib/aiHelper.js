/**
 * Shared AI helper for Nexus-1MD
 * Modularized wrappers for all AI commands.
 * Easily update API endpoints or keys in each function below.
 */

const axios = require("axios");
const { openaiKey, groqKey, gurutechKey } = require("../config");

// ── Per-User AI Rate Limiter ─────────────────────────────────────────────────
const AI_HOURLY_LIMIT = 10;  // max requests per user per hour
const AI_DAILY_LIMIT  = 30;  // max requests per user per day
const aiUsage = new Map(); // key: userId -> { hourCount, hourReset, dayCount, dayReset }

function checkAILimit(userId) {
    const now = Date.now();
    const hour = 60 * 60 * 1000;
    const day  = 24 * hour;

    if (!aiUsage.has(userId)) {
        aiUsage.set(userId, { hourCount: 0, hourReset: now + hour, dayCount: 0, dayReset: now + day });
    }

    const u = aiUsage.get(userId);
    if (now > u.hourReset) { u.hourCount = 0; u.hourReset = now + hour; }
    if (now > u.dayReset)  { u.dayCount  = 0; u.dayReset  = now + day;  }

    if (u.dayCount >= AI_DAILY_LIMIT) {
        return { allowed: false, reason: `⛔ You've hit your *daily AI limit* (${AI_DAILY_LIMIT} queries). Reset in \`${Math.ceil((u.dayReset - now) / 3600000)}h\`.` };
    }
    if (u.hourCount >= AI_HOURLY_LIMIT) {
        return { allowed: false, reason: `⏳ Slow down! Max *${AI_HOURLY_LIMIT} AI queries/hour*. Reset in \`${Math.ceil((u.hourReset - now) / 60000)}m\`.` };
    }

    u.hourCount++;
    u.dayCount++;
    return { allowed: true };
}

/**
 * Helper to query GuruTech API Hub (Supabase Edge Proxy)
 */
async function callGuruTech(action, prompt, extraPayload = {}) {
    const key = gurutechKey || process.env.GURUTECH_API_KEY || "guru_887hpyq48sx5vhf1e7htfgunpiynmaaf";
    try {
        const { data } = await axios.post("https://ktrenqecceeooyrquooc.supabase.co/functions/v1/api-proxy", {
            apiKey: key,
            action: action,
            payload: { prompt, ...extraPayload }
        }, { timeout: 25000 });

        if (data && (data.statusCode === 200 || data.response)) {
            const ans = data.response || data.result || data.output || data.message;
            if (ans && typeof ans === "string") return ans.trim();
        }
    } catch (e) {
        console.warn(`GuruTech API [${action}] failed:`, e.message);
    }
    return null;
}

/**
 * Core askAI wrapper for general queries (.ai, .ask)
 * @param {string} userPrompt
 * @param {string} [system]
 * @returns {Promise<string>}
 */
async function askAI(userPrompt, system = "You are Nexus, a helpful, friendly WhatsApp assistant.") {
    // 1. Try GuruTech API (Primary - Powered by GuruTech Key)
    const guruRes = await callGuruTech("chat", userPrompt);
    if (guruRes) return guruRes;

    // 2. Try Groq (Primary for speed if key set)
    if (groqKey) {
        const groqModels = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "qwen/qwen3-32b"];
        for (const model of groqModels) {
            try {
                const { data } = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
                    model,
                    messages: [{ role: "system", content: system }, { role: "user", content: userPrompt }]
                }, { 
                    headers: { "Authorization": `Bearer ${groqKey}` },
                    timeout: 10000
                });
                return data.choices[0].message.content.trim();
            } catch (e) {
                console.error(`Groq [${model}] failed:`, e.response?.data?.error?.message || e.message);
            }
        }
    }

    // 3. Try OpenAI
    if (openaiKey) {
        try {
            const { data } = await axios.post("https://api.openai.com/v1/chat/completions", {
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: system }, { role: "user", content: userPrompt }]
            }, { 
                headers: { "Authorization": `Bearer ${openaiKey}` },
                timeout: 10000
            });
            return data.choices[0].message.content.trim();
        } catch (e) {
            console.error("OpenAI API failed:", e.message);
        }
    }

    // 4. Fallback to Pollinations AI
    const models = ["openai", "mistral", "llama"];
    const delay = (ms) => new Promise(res => setTimeout(res, ms));
    let lastError = null;

    for (let attempt = 0; attempt < 2; attempt++) {
        for (const model of models) {
            try {
                const { data } = await axios.post("https://text.pollinations.ai/", {
                    messages: [
                        { role: "system", content: system },
                        { role: "user", content: userPrompt }
                    ],
                    model: model,
                    system: system,
                    seed: Math.floor(Math.random() * 999999)
                }, { 
                    timeout: 20000, 
                    responseType: "text",
                    headers: { 
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' 
                    }
                });

                if (data && typeof data === "string" && data.length > 3 && !data.includes("error")) {
                    return data.trim();
                }
            } catch (err) {
                lastError = err;
                if (err.response?.status === 429) {
                    await delay(1000);
                }
                continue;
            }
        }
    }
    
    throw lastError || new Error("AI service overloaded.");
}

/**
 * Wrapper for DeepSeek V3 API (.deepseek, .ds, .guru)
 * Powered by GuruTech API (gurutechKey)
 */
async function askDeepseek(userPrompt) {
    const guruRes = await callGuruTech("deepseek", userPrompt);
    if (guruRes) return guruRes;

    return await askAI(userPrompt, "You are DeepSeek V3, an advanced AI reasoning assistant.");
}

/**
 * Wrapper for Conversational Chat AI (.chat, .talk, .convo)
 * Add custom API endpoints here when available.
 */
async function askChat(userPrompt, system) {
    const defaultSystem = system || 
        "You are Nexus, a witty and friendly WhatsApp chatbot. " +
        "Keep responses conversational, warm, and brief (under 150 words). " +
        "Use emojis occasionally to match the WhatsApp vibe.";

    // [CUSTOM API SPOT]: Insert custom Chat API calls here later
    return await askAI(userPrompt, defaultSystem);
}

/**
 * Wrapper for Code Generation AI (.code, .codegen, .program)
 * Add custom API endpoints here when available.
 */
async function askCode(userPrompt, system) {
    const defaultSystem = system ||
        "You are an expert software engineer. " +
        "When given a task, respond ONLY with the code and a very short explanation. " +
        "Format the code inside triple backticks with the language name. " +
        "Be concise and practical. Do not add unnecessary filler text.";

    // [CUSTOM API SPOT]: Insert custom Code AI calls here later
    return await askAI(userPrompt, defaultSystem);
}

/**
 * Wrapper for Topic Explanation AI (.explain, .whatis)
 * Add custom API endpoints here when available.
 */
async function askExplain(topic, system) {
    const defaultSystem = system ||
        "You are a brilliant teacher who explains complex topics simply. " +
        "Give a clear, structured explanation in plain language anyone can understand. " +
        "Use an analogy when helpful. Keep it under 200 words. Use bullet points if listing key facts.";

    // [CUSTOM API SPOT]: Insert custom Explainer AI calls here later
    return await askAI(`Explain: ${topic}`, defaultSystem);
}

/**
 * Wrapper for Group Discussion Summarizer AI (.summarize, .summary)
 * Add custom API endpoints here when available.
 */
async function askSummarize(chatLog, system) {
    const defaultSystem = system ||
        "You are Nexus-1MD, a highly intelligent group moderator. " +
        "Your job is to summarize discussions so people can catch up quickly.";

    const prompt = `Summarize the following WhatsApp group discussion concisely in bullet points. Focus on the main topics and any decisions made. Keep it professional and brief.\n\nDISCUSSION:\n${chatLog}`;

    // [CUSTOM API SPOT]: Insert custom Summarizer AI calls here later
    return await askAI(prompt, defaultSystem);
}

/**
 * Wrapper for Image Generation AI (.imagine, .draw, .img)
 * Add custom API endpoints here when available.
 */
async function generateImage(prompt, width = 768, height = 768) {
    // [CUSTOM API SPOT]: Insert custom Image API calls here later
    try {
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
                    `?width=${width}&height=${height}&nologo=true&seed=${Math.floor(Math.random() * 999999)}`;

        const { data } = await axios.get(url, { timeout: 60000, responseType: "arraybuffer" });
        return Buffer.from(data);
    } catch (err) {
        console.error("AI Image Generation failed:", err.message);
        if (err.response?.status === 402 || err.response?.status === 429) {
            throw new Error("AI Image Queue is currently full. Please try again in 5-10 minutes.");
        }
        throw new Error("AI Image service is unavailable.");
    }
}

module.exports = {
    askAI,
    askDeepseek,
    askChat,
    askCode,
    askExplain,
    askSummarize,
    generateImage,
    checkAILimit
};
