"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const index_js_1 = require("../config/index.js");
const database_js_1 = require("../utils/database.js");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Lihat informasi dan riwayat moderasi member')
    .addUserOption(opt => opt.setName('user').setDescription('Member yang ingin dilihat').setRequired(false));
async function execute(interaction) {
    const target = interaction.options.getMember('user') || interaction.member;
    if (!target) {
        await interaction.reply({ content: '❌ Member tidak ditemukan.', ephemeral: true });
        return;
    }
    const warnCount = (0, database_js_1.getWarnCount)(interaction.guildId, target.user.id);
    const warns = (0, database_js_1.getWarns)(interaction.guildId, target.user.id);
    const lastWarn = warns[0];
    const roles = target.roles.cache
        .filter(r => r.id !== interaction.guildId)
        .sort((a, b) => b.position - a.position)
        .first(5)
        .map(r => `<@&${r.id}>`)
        .join(', ') || 'Tidak ada';
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(index_js_1.config.colors.info)
        .setTitle(`👤 Info Member: ${target.user.tag}`)
        .setThumbnail(target.user.displayAvatarURL({ size: 256 }))
        .addFields({ name: 'Username', value: target.user.tag, inline: true }, { name: 'ID', value: target.user.id, inline: true }, { name: 'Bot?', value: target.user.bot ? 'Ya' : 'Tidak', inline: true }, { name: 'Bergabung Server', value: `<t:${Math.floor((target.joinedTimestamp || 0) / 1000)}:R>`, inline: true }, { name: 'Akun Dibuat', value: `<t:${Math.floor(target.user.createdTimestamp / 1000)}:R>`, inline: true }, { name: 'Nickname', value: target.nickname || 'Tidak ada', inline: true }, { name: 'Top 5 Role', value: roles, inline: false }, { name: `${index_js_1.config.emojis.warn} Total Peringatan`, value: String(warnCount), inline: true }, { name: 'Peringatan Terakhir', value: lastWarn ? `<t:${Math.floor(lastWarn.timestamp / 1000)}:R>` : 'Tidak ada', inline: true })
        .setTimestamp();
    await interaction.reply({ embeds: [embed] });
}
//# sourceMappingURL=userinfo.js.map