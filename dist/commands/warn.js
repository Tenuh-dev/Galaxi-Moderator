"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const index_js_1 = require("../config/index.js");
const database_js_1 = require("../utils/database.js");
const modLogger_js_1 = require("../utils/modLogger.js");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('warn')
    .setDescription('Beri peringatan kepada member')
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName('user').setDescription('Member yang akan diperingati').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Alasan peringatan').setRequired(true));
async function execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason', true);
    if (!target) {
        await interaction.reply({ content: '❌ Member tidak ditemukan.', ephemeral: true });
        return;
    }
    if (target.user.bot) {
        await interaction.reply({ content: '❌ Tidak bisa memberi peringatan ke bot.', ephemeral: true });
        return;
    }
    if (target.permissions.has('Administrator')) {
        await interaction.reply({ content: '❌ Tidak bisa memberi peringatan ke Administrator.', ephemeral: true });
        return;
    }
    const warnId = (0, database_js_1.addWarn)(interaction.guildId, target.user.id, interaction.user.id, reason);
    const warnCount = (0, database_js_1.getWarnCount)(interaction.guildId, target.user.id);
    await (0, modLogger_js_1.sendModDM)(target.user, 'warn', interaction.guild.name, reason, `Ini peringatan ke-**${warnCount}** kamu.`);
    await (0, modLogger_js_1.logModAction)(interaction.guild, 'warn', target.user, interaction.user, reason, { 'ID Peringatan': String(warnId), 'Total Peringatan': String(warnCount) });
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(index_js_1.config.colors.warning)
        .setTitle(`${index_js_1.config.emojis.warn} Peringatan Diberikan`)
        .addFields({ name: 'Member', value: `${target.user.tag}`, inline: true }, { name: 'Alasan', value: reason, inline: true }, { name: 'Total Peringatan', value: String(warnCount), inline: true })
        .setTimestamp();
    await interaction.reply({ embeds: [embed] });
}
//# sourceMappingURL=warn.js.map