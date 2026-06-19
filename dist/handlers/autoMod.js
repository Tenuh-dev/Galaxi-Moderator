"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAutoMod = runAutoMod;
const discord_js_1 = require("discord.js");
const index_js_1 = require("../config/index.js");
const toxicPatterns_js_1 = require("../utils/toxicPatterns.js");
const spamDetector_js_1 = require("./spamDetector.js");
const modLogger_js_1 = require("../utils/modLogger.js");
const database_js_1 = require("../utils/database.js");
function getTextChannel(message) {
    if (message.channel instanceof discord_js_1.TextChannel)
        return message.channel;
    return null;
}
async function runAutoMod(message) {
    if (!message.guild || !message.member || message.author.bot)
        return;
    if (message.member.permissions.has('Administrator'))
        return;
    if (message.member.permissions.has('ManageMessages'))
        return;
    const content = message.content;
    // 1. Cek spam
    const spamResult = await (0, spamDetector_js_1.detectSpam)(message);
    if (spamResult.isSpam) {
        await (0, spamDetector_js_1.handleSpam)(message, spamResult.type);
        await (0, modLogger_js_1.logModAction)(message.guild, spamResult.type === 'tag_spam' ? 'tag_spam' : 'spam', message.author, message.client.user, `Auto-Mod: ${spamResult.type}`, { channel: message.channel.toString() });
        return;
    }
    // 2. Cek phishing
    const phishResult = (0, toxicPatterns_js_1.isPhishingLink)(content);
    if (phishResult.isPhishing) {
        await handlePhishing(message, phishResult.url, phishResult.reason);
        return;
    }
    // 3. Cek invite Discord tidak sah
    if (toxicPatterns_js_1.INVITE_PATTERN.test(content)) {
        toxicPatterns_js_1.INVITE_PATTERN.lastIndex = 0;
        if (!message.member.permissions.has('ManageGuild')) {
            await handleUnauthorizedInvite(message);
            return;
        }
    }
    toxicPatterns_js_1.INVITE_PATTERN.lastIndex = 0;
    // 4. Cek kata toxic
    const toxicResult = (0, toxicPatterns_js_1.containsToxicWord)(content);
    if (toxicResult.found) {
        await handleToxic(message, toxicResult.word, toxicResult.category);
        return;
    }
}
async function handlePhishing(message, url, reason) {
    if (!message.guild || !message.member)
        return;
    const ch = getTextChannel(message);
    try {
        await message.delete().catch(() => { });
        const member = message.member;
        await (0, modLogger_js_1.sendModDM)(message.author, 'phishing', message.guild.name, reason, `Link yang kamu kirim terindikasi phishing: \`${url.substring(0, 60)}\``);
        if (member.moderatable) {
            await member.timeout(30 * 60 * 1000, `Auto-Mod: Phishing - ${reason}`);
        }
        (0, database_js_1.addWarn)(message.guild.id, message.author.id, message.client.user.id, `Phishing: ${reason}`);
        const warnCount = (0, database_js_1.getWarnCount)(message.guild.id, message.author.id);
        await (0, modLogger_js_1.logModAction)(message.guild, 'phishing', message.author, message.client.user, reason, { url: url.substring(0, 100), warns: String(warnCount) });
        if (ch) {
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(index_js_1.config.colors.error)
                .setTitle(`${index_js_1.config.emojis.phish} Phishing Terdeteksi!`)
                .setDescription(`<@${message.author.id}> mengirimkan link phishing dan telah di-timeout 30 menit.\n\n**Peringatan:** Jangan klik link mencurigakan!`)
                .setTimestamp();
            const warning = await ch.send({ embeds: [embed] });
            setTimeout(() => warning.delete().catch(() => { }), 15000);
        }
        await checkWarnThreshold(message, warnCount);
    }
    catch (error) {
        console.error('Error saat handle phishing:', error);
    }
}
async function handleUnauthorizedInvite(message) {
    if (!message.guild || !message.member)
        return;
    const ch = getTextChannel(message);
    try {
        await message.delete().catch(() => { });
        if (ch) {
            const warning = await ch.send({
                content: `${index_js_1.config.emojis.warn} <@${message.author.id}> Mengirim invite Discord tidak diizinkan di server ini! Pesan dihapus.`,
            });
            setTimeout(() => warning.delete().catch(() => { }), 8000);
        }
        await (0, modLogger_js_1.logModAction)(message.guild, 'delete', message.author, message.client.user, 'Mengirim invite Discord tanpa izin', { channel: message.channel.toString() });
    }
    catch (error) {
        console.error('Error saat handle invite:', error);
    }
}
async function handleToxic(message, word, category) {
    if (!message.guild || !message.member)
        return;
    const ch = getTextChannel(message);
    try {
        await message.delete().catch(() => { });
        const member = message.member;
        (0, database_js_1.addWarn)(message.guild.id, message.author.id, message.client.user.id, `Konten toxic (${category})`);
        const warnCount = (0, database_js_1.getWarnCount)(message.guild.id, message.author.id);
        if (member.moderatable) {
            await member.timeout(index_js_1.config.moderation.timeoutDurationMs, `Auto-Mod: Konten toxic`);
        }
        await (0, modLogger_js_1.sendModDM)(message.author, 'toxic', message.guild.name, `Konten toxic terdeteksi (${category})`, `Pesan kamu dihapus karena mengandung konten yang tidak pantas. Ini peringatan ke-**${warnCount}**.`);
        await (0, modLogger_js_1.logModAction)(message.guild, 'toxic', message.author, message.client.user, `Konten toxic: ${category}`, { warns: String(warnCount), channel: message.channel.toString() });
        if (ch) {
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(index_js_1.config.colors.warning)
                .setTitle(`${index_js_1.config.emojis.toxic} Konten Tidak Pantas Dihapus`)
                .setDescription(`<@${message.author.id}> pesan kamu dihapus karena mengandung kata yang tidak pantas.\n**Peringatan: ${warnCount}**`)
                .setTimestamp();
            const warning = await ch.send({ embeds: [embed] });
            setTimeout(() => warning.delete().catch(() => { }), 8000);
        }
        await checkWarnThreshold(message, warnCount);
    }
    catch (error) {
        console.error('Error saat handle toxic:', error);
    }
}
async function checkWarnThreshold(message, warnCount) {
    if (!message.guild || !message.member)
        return;
    const ch = getTextChannel(message);
    const settings = (0, database_js_1.getGuildSettings)(message.guild.id);
    const maxWarnsKick = settings.max_warns_kick ?? index_js_1.config.moderation.maxWarnsBeforeKick;
    const maxWarnsBan = settings.max_warns_ban ?? index_js_1.config.moderation.maxWarnsBeforeBan;
    const member = message.member;
    if (warnCount >= maxWarnsBan) {
        if (member.bannable) {
            await (0, modLogger_js_1.sendModDM)(message.author, 'ban', message.guild.name, `Mencapai batas peringatan maksimum (${warnCount})`);
            await member.ban({ reason: `Auto-Mod: Mencapai ${warnCount} peringatan`, deleteMessageSeconds: 86400 });
            await (0, modLogger_js_1.logModAction)(message.guild, 'ban', message.author, message.client.user, `Auto-ban: ${warnCount} peringatan`);
            if (ch)
                await ch.send({ content: `${index_js_1.config.emojis.ban} <@${message.author.id}> telah di-**BAN** karena mencapai batas peringatan maksimum (${warnCount}).` });
        }
    }
    else if (warnCount >= maxWarnsKick) {
        if (member.kickable) {
            await (0, modLogger_js_1.sendModDM)(message.author, 'kick', message.guild.name, `Mencapai batas peringatan (${warnCount})`);
            await member.kick(`Auto-Mod: Mencapai ${warnCount} peringatan`);
            await (0, modLogger_js_1.logModAction)(message.guild, 'kick', message.author, message.client.user, `Auto-kick: ${warnCount} peringatan`);
            if (ch)
                await ch.send({ content: `${index_js_1.config.emojis.kick} <@${message.author.id}> telah di-**KICK** karena mencapai batas peringatan (${warnCount}).` });
        }
    }
}
//# sourceMappingURL=autoMod.js.map