"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.once = exports.name = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const index_js_1 = require("../config/index.js");
const database_js_1 = require("../utils/database.js");
exports.name = discord_js_1.Events.GuildMemberAdd;
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
            .setColor(index_js_1.config.colors.success)
            .setTitle('👋 Member Baru Bergabung')
            .setThumbnail(member.user.displayAvatarURL())
            .addFields({ name: 'Pengguna', value: `${member.user.tag} (${member.user.id})`, inline: true }, { name: 'Akun Dibuat', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }, { name: 'Total Member', value: String(member.guild.memberCount), inline: true })
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error('Error pada guildMemberAdd event:', error);
    }
}
//# sourceMappingURL=guildMemberAdd.js.map