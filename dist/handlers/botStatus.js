"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBotStatusCommand = handleBotStatusCommand;
const discord_js_1 = require("discord.js");
const index_js_1 = require("../config/index.js");
async function handleBotStatusCommand(message) {
    if (!message.guild)
        return;
    try {
        const guild = message.guild;
        const client = message.client;
        // Ambil semua bot di server
        await guild.members.fetch();
        const bots = guild.members.cache.filter(m => m.user.bot);
        // Info uptime bot ini
        const uptime = formatUptime(client.uptime || 0);
        const ping = client.ws.ping;
        const memUsage = process.memoryUsage();
        const ramUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
        // Buat embed utama
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(index_js_1.config.colors.info)
            .setTitle(`${index_js_1.config.emojis.bot} Status Bot di Server ${guild.name}`)
            .setThumbnail(client.user?.displayAvatarURL() || null)
            .setDescription(`Berikut adalah daftar semua bot yang aktif di server ini:\n\u200b`)
            .addFields({
            name: `${index_js_1.config.emojis.star} Galaxi Auto Moderator`,
            value: [
                `> **Status:** 🟢 Online`,
                `> **Ping:** ${ping}ms`,
                `> **Uptime:** ${uptime}`,
                `> **RAM:** ${ramUsed} MB`,
                `> **Versi Discord.js:** 14.x`,
                `> **Fungsi:** Auto Moderasi (Anti-Toxic, Anti-Phishing, Anti-Spam)`,
            ].join('\n'),
            inline: false,
        })
            .setTimestamp()
            .setFooter({ text: `Total bot di server: ${bots.size} | Galaxi Moderator`, iconURL: client.user?.displayAvatarURL() });
        // Tambah info bot lain
        let otherBots = '';
        let count = 0;
        for (const [, member] of bots) {
            if (member.user.id === client.user?.id)
                continue;
            if (count >= 10) {
                otherBots += `\n_...dan ${bots.size - 11} bot lainnya_`;
                break;
            }
            const status = getBotStatus(member);
            otherBots += `> ${status} **${member.user.username}** — ${member.user.id}\n`;
            count++;
        }
        if (otherBots) {
            embed.addFields({
                name: `${index_js_1.config.emojis.bot} Bot Lain di Server (${bots.size - 1})`,
                value: otherBots || 'Tidak ada bot lain.',
                inline: false,
            });
        }
        // Tambah stats server
        embed.addFields({
            name: '📊 Statistik Server',
            value: [
                `> **Total Member:** ${guild.memberCount}`,
                `> **Total Bot:** ${bots.size}`,
                `> **Total Channel:** ${guild.channels.cache.size}`,
                `> **Dibuat:** <t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
            ].join('\n'),
            inline: false,
        });
        await message.reply({ embeds: [embed] });
    }
    catch (error) {
        console.error('Error saat handle bot status:', error);
        await message.reply('❌ Gagal mengambil status bot. Coba lagi nanti.').catch(() => { });
    }
}
function getBotStatus(member) {
    const presence = member.presence;
    if (!presence)
        return '⚫';
    switch (presence.status) {
        case 'online': return '🟢';
        case 'idle': return '🟡';
        case 'dnd': return '🔴';
        default: return '⚫';
    }
}
function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0)
        return `${days}h ${hours % 24}j ${minutes % 60}m`;
    if (hours > 0)
        return `${hours}j ${minutes % 60}m ${seconds % 60}d`;
    if (minutes > 0)
        return `${minutes}m ${seconds % 60}d`;
    return `${seconds}d`;
}
//# sourceMappingURL=botStatus.js.map