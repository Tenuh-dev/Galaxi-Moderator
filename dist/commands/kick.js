"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const index_js_1 = require("../config/index.js");
const modLogger_js_1 = require("../utils/modLogger.js");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick member dari server')
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.KickMembers)
    .addUserOption(opt => opt.setName('user').setDescription('Member yang akan di-kick').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Alasan kick').setRequired(false));
async function execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'Tidak ada alasan';
    if (!target) {
        await interaction.reply({ content: '❌ Member tidak ditemukan.', ephemeral: true });
        return;
    }
    if (!target.kickable) {
        await interaction.reply({ content: '❌ Saya tidak bisa kick member ini.', ephemeral: true });
        return;
    }
    await (0, modLogger_js_1.sendModDM)(target.user, 'kick', interaction.guild.name, reason);
    await target.kick(reason);
    await (0, modLogger_js_1.logModAction)(interaction.guild, 'kick', target.user, interaction.user, reason);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(index_js_1.config.colors.error)
        .setTitle(`${index_js_1.config.emojis.kick} Member Dikick`)
        .addFields({ name: 'Member', value: target.user.tag, inline: true }, { name: 'Alasan', value: reason, inline: true })
        .setTimestamp();
    await interaction.reply({ embeds: [embed] });
}
//# sourceMappingURL=kick.js.map