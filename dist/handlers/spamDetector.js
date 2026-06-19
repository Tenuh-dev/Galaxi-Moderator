"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectSpam = detectSpam;
exports.handleSpam = handleSpam;
const discord_js_1 = require("discord.js");
const index_js_1 = require("../config/index.js");
const database_js_1 = require("../utils/database.js");
const spamMap = new Map();
async function detectSpam(message) {
    if (!message.guild || !message.member)
        return { isSpam: false, type: '' };
    const settings = (0, database_js_1.getGuildSettings)(message.guild.id);
    const spamThreshold = settings.spam_threshold ?? index_js_1.config.moderation.spamThreshold;
    const spamInterval = settings.spam_interval_ms ?? index_js_1.config.moderation.spamIntervalMs;
    const maxMentions = settings.max_mentions ?? index_js_1.config.moderation.maxMentions;
    const key = `${message.guild.id}-${message.author.id}`;
    const now = Date.now();
    // Cek spam mention/tag
    const mentionCount = message.mentions.users.size + message.mentions.roles.size;
    if (mentionCount > maxMentions) {
        return { isSpam: true, type: 'tag_spam' };
    }
    // Cek spam @everyone / @here oleh non-admin
    if (message.mentions.everyone && !message.member.permissions.has('MentionEveryone')) {
        return { isSpam: true, type: 'tag_spam' };
    }
    // Cek spam pesan berulang
    let tracker = spamMap.get(key);
    if (!tracker) {
        tracker = { messages: [], warned: false };
        spamMap.set(key, tracker);
    }
    tracker.messages = tracker.messages.filter(t => now - t < spamInterval);
    tracker.messages.push(now);
    // Cek duplikat pesan
    const recentMessages = await getRecentMessages(message);
    const isDuplicate = recentMessages.filter(m => m.author.id === message.author.id &&
        m.content === message.content &&
        m.id !== message.id &&
        now - m.createdTimestamp < spamInterval).length >= 2;
    if (isDuplicate) {
        return { isSpam: true, type: 'spam_duplicate' };
    }
    if (tracker.messages.length >= spamThreshold) {
        tracker.messages = [];
        return { isSpam: true, type: 'spam_flood' };
    }
    setTimeout(() => {
        if (spamMap.has(key)) {
            const t = spamMap.get(key);
            t.messages = t.messages.filter(ts => Date.now() - ts < spamInterval);
            if (t.messages.length === 0)
                spamMap.delete(key);
        }
    }, spamInterval);
    return { isSpam: false, type: '' };
}
async function getRecentMessages(message) {
    try {
        if (!(message.channel instanceof discord_js_1.TextChannel))
            return [];
        const messages = await message.channel.messages.fetch({ limit: 10 });
        return Array.from(messages.values());
    }
    catch {
        return [];
    }
}
async function handleSpam(message, type) {
    if (!message.guild || !message.member)
        return;
    try {
        await message.delete().catch(() => { });
        const spamTypeLabel = type === 'tag_spam'
            ? 'Spam Tag/Mention'
            : type === 'spam_duplicate'
                ? 'Spam Pesan Duplikat'
                : 'Spam Flood';
        const member = message.member;
        if (member.moderatable) {
            await member.timeout(5 * 60 * 1000, `Auto-Mod: ${spamTypeLabel}`);
        }
        if (message.channel instanceof discord_js_1.TextChannel) {
            const warning = await message.channel.send({
                content: `${index_js_1.config.emojis.spam} <@${message.author.id}> **Peringatan!** Kamu terdeteksi melakukan **${spamTypeLabel}**. Pesan dihapus dan kamu di-timeout selama 5 menit.`,
            });
            setTimeout(() => warning.delete().catch(() => { }), 8000);
        }
    }
    catch (error) {
        console.error('Error saat handle spam:', error);
    }
}
//# sourceMappingURL=spamDetector.js.map