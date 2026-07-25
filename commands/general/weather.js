const axios = require("axios");

module.exports = {
    name: "weather",
    description: "Check current weather for a city.",
    category: "general",
    async execute({ sock, jid, args, msg }) {
        const city = args.join(" ");
        if (!city) return await sock.sendMessage(jid, { text: "❓ *Usage:* `.weather <city>`" }, { quoted: msg });

        try {
            const { data } = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
            
            if (!data || !data.current_condition || data.current_condition.length === 0) {
                return await sock.sendMessage(jid, { text: "❌ City not found." }, { quoted: msg });
            }

            const current = data.current_condition[0];
            const area = data.nearest_area ? data.nearest_area[0] : null;
            const locationName = area ? `${area.areaName[0].value}, ${area.country[0].value}` : city;

            const temp = current.temp_C;
            const feelsLike = current.FeelsLikeC;
            const condition = current.weatherDesc ? current.weatherDesc[0].value : "Unknown";
            const humidity = current.humidity;
            const wind = `${current.windspeedKmph} km/h`;

            const weatherText = `🌤️ *WEATHER: ${locationName}*\n━━━━━━━━━━━━━━━━━━━\n\n` +
                                `🌡️ *Temp:* ${temp} °C (Feels like ${feelsLike} °C)\n` +
                                `🌥️ *Condition:* ${condition}\n` +
                                `💧 *Humidity:* ${humidity}%\n` +
                                `💨 *Wind:* ${wind}\n\n` +
                                `_Stay safe and plan accordingly!_`;

            await sock.sendMessage(jid, { text: weatherText }, { quoted: msg });
        } catch (err) {
            console.error("Weather error:", err);
            await sock.sendMessage(jid, { text: "❌ Error fetching weather data." }, { quoted: msg });
        }
    }
};
