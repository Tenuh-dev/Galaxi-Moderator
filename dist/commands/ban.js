"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const index_js_1 = require("../config/index.js");
const modLogger_js_1 = require("../utils/modLogger.js");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban member dari server')
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.BanMembers)
    .addUserOption(opt => opt.setName('user').setDescription('Member yang akan di-ban').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Alasan ban').setRequired(false))
    .addIntegerOption(opt => opt.setName('delete_days').setDescription('Hapus pesan berapa hari terakhir (0-7)').setMinValue(0).setMaxValue(7));
async function execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'Tidak ada alasan';
    const deleteDays = interaction.options.getInteger('delete_days') || 0;
    if (!target) {
        await interaction.reply({ content: '❌ Member tidak ditemukan.', ephemeral: true });
        return;
    }
    if (!target.bannable) {
        await interaction.reply({ content: '❌ Saya tidak bisa ban member ini.', ephemeral: true });
        return;
    }
    await (0, modLogger_js_1.sendModDM)(target.user, 'ban', interaction.guild.name, reason);
    await target.ban({ reason, deleteMessageSeconds: deleteDays * 86400 });
    await (0, modLogger_js_1.logModAction)(interaction.guild, 'ban', target.user, interaction.user, reason, {
        'Hapus Pesan': `${deleteDays} hari`,
    });
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(0x000000)
        .setTitle(`${index_js_1.config.emojis.ban} Member Dibanned`)
        .addFields({ name: 'Member', value: target.user.tag, inline: true }, { name: 'Alasan', value: reason, inline: true })
        .setTimestamp();
    await interaction.reply({ embeds: [embed] });
}
//# sourceMappingURL=ban.js.map