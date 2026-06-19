"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const index_js_1 = require("../config/index.js");
const database_js_1 = require("../utils/database.js");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Kelola peringatan member')
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ModerateMembers)
    .addSubcommand(sub => sub.setName('list')
    .setDescription('Lihat daftar peringatan member')
    .addUserOption(opt => opt.setName('user').setDescription('Member').setRequired(true)))
    .addSubcommand(sub => sub.setName('clear')
    .setDescription('Hapus semua peringatan member')
    .addUserOption(opt => opt.setName('user').setDescription('Member').setRequired(true)))
    .addSubcommand(sub => sub.setName('remove')
    .setDescription('Hapus peringatan tertentu berdasarkan ID')
    .addIntegerOption(opt => opt.setName('id').setDescription('ID peringatan').setRequired(true)));
async function execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'list') {
        const target = interaction.options.getMember('user');
        if (!target) {
            await interaction.reply({ content: '❌ Member tidak ditemukan.', ephemeral: true });
            return;
        }
        const warns = (0, database_js_1.getWarns)(interaction.guildId, target.user.id);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(index_js_1.config.colors.warning)
            .setTitle(`${index_js_1.config.emojis.warn} Peringatan: ${target.user.tag}`)
            .setThumbnail(target.user.displayAvatarURL())
            .setTimestamp();
        if (warns.length === 0) {
            embed.setDescription('Pengguna ini tidak memiliki peringatan.');
        }
        else {
            const warnList = warns.slice(0, 10).map((w, i) => `**#${w.id}** — <t:${Math.floor(w.timestamp / 1000)}:R>\n> ${w.reason}\n> Oleh: <@${w.moderator_id}>`).join('\n\n');
            embed.setDescription(warnList);
            embed.setFooter({ text: `Total: ${warns.length} peringatan` });
        }
        await interaction.reply({ embeds: [embed] });
    }
    else if (sub === 'clear') {
        const target = interaction.options.getMember('user');
        if (!target) {
            await interaction.reply({ content: '❌ Member tidak ditemukan.', ephemeral: true });
            return;
        }
        const count = (0, database_js_1.clearWarns)(interaction.guildId, target.user.id);
        await interaction.reply({
            content: `${index_js_1.config.emojis.check} Berhasil menghapus **${count}** peringatan dari ${target.user.tag}.`,
        });
    }
    else if (sub === 'remove') {
        const id = interaction.options.getInteger('id', true);
        const success = (0, database_js_1.removeWarn)(id);
        if (success) {
            await interaction.reply({ content: `${index_js_1.config.emojis.check} Peringatan #${id} berhasil dihapus.` });
        }
        else {
            await interaction.reply({ content: `❌ Peringatan #${id} tidak ditemukan.`, ephemeral: true });
        }
    }
}
//# sourceMappingURL=warnings.js.map