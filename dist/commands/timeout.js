"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const index_js_1 = require("../config/index.js");
const modLogger_js_1 = require("../utils/modLogger.js");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout member (tidak bisa chat sementara)')
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName('user').setDescription('Member yang akan di-timeout').setRequired(true))
    .addIntegerOption(opt => opt.setName('duration').setDescription('Durasi timeout dalam menit').setRequired(true).setMinValue(1).setMaxValue(10080))
    .addStringOption(opt => opt.setName('reason').setDescription('Alasan timeout').setRequired(false));
async function execute(interaction) {
    const target = interaction.options.getMember('user');
    const durationMin = interaction.options.getInteger('duration', true);
    const reason = interaction.options.getString('reason') || 'Tidak ada alasan';
    if (!target) {
        await interaction.reply({ content: '❌ Member tidak ditemukan.', ephemeral: true });
        return;
    }
    if (!target.moderatable) {
        await interaction.reply({ content: '❌ Saya tidak bisa timeout member ini.', ephemeral: true });
        return;
    }
    const durationMs = durationMin * 60 * 1000;
    await target.timeout(durationMs, reason);
    await (0, modLogger_js_1.sendModDM)(target.user, 'timeout', interaction.guild.name, reason, `Durasi: **${durationMin} menit**`);
    await (0, modLogger_js_1.logModAction)(interaction.guild, 'timeout', target.user, interaction.user, reason, {
        'Durasi': `${durationMin} menit`,
    });
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(index_js_1.config.colors.warning)
        .setTitle(`⏱️ Member Di-timeout`)
        .addFields({ name: 'Member', value: target.user.tag, inline: true }, { name: 'Durasi', value: `${durationMin} menit`, inline: true }, { name: 'Alasan', value: reason, inline: false })
        .setTimestamp();
    await interaction.reply({ embeds: [embed] });
}
//# sourceMappingURL=timeout.js.map