// per-user cooldown management
// command-level cooldowns
// basic spam protection

const cooldowns = new Map();

/**
 * key = userId + command
 * value = timestamp
 */

function isOnCooldown(user, command, timeLimit = 3000) {
    const key = `${user}:${command}`;
    const now = Date.now();

    if (cooldowns.has(key)) {
        const lastTime = cooldowns.get(key);
        const diff = now - lastTime;

        if (diff < timeLimit) {
            return {
                active: true,
                remaining: timeLimit - diff
            };
        }
    }

    cooldowns.set(key, now);
    return { active: false };
}

const groupCooldown = new Map();

function groupSpamGuard(jid, limit = 1000) {
    const now = Date.now();

    if (groupCooldown.has(jid)) {
        const last = groupCooldown.get(jid);

        if (now - last < limit) {
            return true;
        }
    }

    groupCooldown.set(jid, now);
    return false;
}

module.exports = { isOnCooldown, groupSpamGuard };