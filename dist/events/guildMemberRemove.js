"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.once = exports.name = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const index_js_1 = require("../config/index.js");
const database_js_1 = require("../utils/database.js");
exports.name = discord_js_1.Events.GuildMemberRemove;
exports.once = false;
async function execute(member) {
    const settings = (0, database_js_1.getGuildSettings)(member.guild.id);
    const logChannelId = settings.log_channel_id || index_js_1.config.logChannelId;
    if (!logChannelId)
        return;
    try {
        const logChannel = member.guild.channels.cache.get(logChannelId);
        if (!(logChannel instanceof discord_js_1.TextChannel))
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(index_js_1.config.colors.error)
            .setTitle('🚪 Member Keluar')
            .setThumbnail(member.user?.displayAvatarURL() || null)
            .addFields({ name: 'Pengguna', value: `${member.user?.tag || 'Unknown'} (${member.id})`, inline: true }, { name: 'Total Member', value: String(member.guild.memberCount), inline: true })
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error('Error pada guildMemberRemove event:', error);
    }
}
//# sourceMappingURL=guildMemberRemove.js.map