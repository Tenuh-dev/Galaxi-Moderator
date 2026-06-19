"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logModAction = logModAction;
exports.sendModDM = sendModDM;
const discord_js_1 = require("discord.js");
const index_js_1 = require("../config/index.js");
const database_js_1 = require("./database.js");
const ACTION_COLORS = {
    warn: index_js_1.config.colors.warning,
    mute: index_js_1.config.colors.warning,
    unmute: index_js_1.config.colors.success,
    kick: index_js_1.config.colors.error,
    ban: 0x000000,
    delete: index_js_1.config.colors.info,
    timeout: index_js_1.config.colors.warning,
    spam: index_js_1.config.colors.error,
    phishing: index_js_1.config.colors.error,
    toxic: index_js_1.config.colors.error,
    tag_spam: index_js_1.config.colors.warning,
};
const ACTION_LABELS = {
    warn: `${index_js_1.config.emojis.warn} Peringatan`,
    mute: `${index_js_1.config.emojis.mute} Mute`,
    unmute: `${index_js_1.config.emojis.check} Unmute`,
    kick: `${index_js_1.config.emojis.kick} Kick`,
    ban: `${index_js_1.config.emojis.ban} Ban`,
    delete: `${index_js_1.config.emojis.cross} Hapus Pesan`,
    timeout: `⏱️ Timeout`,
    spam: `${index_js_1.config.emojis.spam} Spam Terdeteksi`,
    phishing: `${index_js_1.config.emojis.phish} Phishing Terdeteksi`,
    toxic: `${index_js_1.config.emojis.toxic} Konten Toxic`,
    tag_spam: `${index_js_1.config.emojis.warn} Spam Tag`,
};
async function logModAction(guild, action, targetUser, moderator, reason, extra) {
    (0, database_js_1.addModLog)(guild.id, action, targetUser.id, moderator.id, reason, extra);
    const settings = (0, database_js_1.getGuildSettings)(guild.id);
    const logChannelId = settings.log_channel_id || index_js_1.config.logChannelId;
    if (!logChannelId)
        return;
    try {
        const logChannel = guild.channels.cache.get(logChannelId);
        if (!logChannel || !(logChannel instanceof discord_js_1.TextChannel))
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(ACTION_LABELS[action] || action.toUpperCase())
            .setColor(ACTION_COLORS[action] || index_js_1.config.colors.info)
            .addFields({ name: 'Pengguna', value: `${targetUser.tag} (${targetUser.id})`, inline: true }, { name: 'Moderator', value: `${moderator.tag}`, inline: true }, { name: 'Alasan', value: reason, inline: false })
            .setThumbnail(targetUser.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: 'Galaxi Auto Moderator', iconURL: guild.client.user?.displayAvatarURL() });
        if (extra) {
            for (const [key, value] of Object.entries(extra)) {
                if (value !== undefined && value !== null) {
                    embed.addFields({ name: key, value: String(value), inline: true });
                }
            }
        }
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error('Error saat mengirim log moderasi:', error);
    }
}
async function sendModDM(user, action, guildName, reason, extra) {
    try {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(`${ACTION_LABELS[action]} di Server ${guildName}`)
            .setColor(ACTION_COLORS[action] || index_js_1.config.colors.info)
            .addFields({ name: 'Alasan', value: reason })
            .setTimestamp()
            .setFooter({ text: 'Galaxi Auto Moderator' });
        if (extra)
            embed.setDescription(extra);
        await user.send({ embeds: [embed] });
    }
    catch {
        // User menonaktifkan DM
    }
}
//# sourceMappingURL=modLogger.js.map