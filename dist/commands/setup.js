"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const index_js_1 = require("../config/index.js");
const database_js_1 = require("../utils/database.js");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('setup')
    .setDescription('Konfigurasi Galaxi Moderator untuk server ini')
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub.setName('logchannel')
    .setDescription('Set channel untuk log moderasi')
    .addChannelOption(opt => opt.setName('channel').setDescription('Channel log').setRequired(true)
    .addChannelTypes(discord_js_1.ChannelType.GuildText)))
    .addSubcommand(sub => sub.setName('status')
    .setDescription('Lihat konfigurasi saat ini'))
    .addSubcommand(sub => sub.setName('spamthreshold')
    .setDescription('Set batas pesan spam (default: 5 pesan / 5 detik)')
    .addIntegerOption(opt => opt.setName('amount').setDescription('Jumlah pesan').setRequired(true).setMinValue(3).setMaxValue(20)))
    .addSubcommand(sub => sub.setName('maxwarns')
    .setDescription('Set batas peringatan sebelum kick/ban')
    .addIntegerOption(opt => opt.setName('kick').setDescription('Peringatan sebelum kick').setRequired(true).setMinValue(1).setMaxValue(10))
    .addIntegerOption(opt => opt.setName('ban').setDescription('Peringatan sebelum ban').setRequired(true).setMinValue(2).setMaxValue(15)));
async function execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'logchannel') {
        const channel = interaction.options.getChannel('channel', true);
        (0, database_js_1.updateGuildSetting)(interaction.guildId, 'log_channel_id', channel.id);
        await interaction.reply({
            content: `${index_js_1.config.emojis.check} Channel log moderasi berhasil diset ke <#${channel.id}>.`,
        });
    }
    else if (sub === 'status') {
        const settings = (0, database_js_1.getGuildSettings)(interaction.guildId);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(index_js_1.config.colors.info)
            .setTitle(`${index_js_1.config.emojis.shield} Konfigurasi Galaxi Moderator`)
            .addFields({ name: 'Log Channel', value: settings.log_channel_id ? `<#${settings.log_channel_id}>` : 'Belum diset', inline: true }, { name: 'Auto-Mod', value: settings.auto_mod_enabled ? '✅ Aktif' : '❌ Nonaktif', inline: true }, { name: 'Spam Threshold', value: `${settings.spam_threshold || 5} pesan / ${(settings.spam_interval_ms || 5000) / 1000}s`, inline: true }, { name: 'Max Warn → Kick', value: String(settings.max_warns_kick || 3), inline: true }, { name: 'Max Warn → Ban', value: String(settings.max_warns_ban || 5), inline: true }, { name: 'Max Mention', value: String(settings.max_mentions || 5), inline: true })
            .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
    else if (sub === 'spamthreshold') {
        const amount = interaction.options.getInteger('amount', true);
        (0, database_js_1.updateGuildSetting)(interaction.guildId, 'spam_threshold', amount);
        await interaction.reply({ content: `${index_js_1.config.emojis.check} Batas spam diset ke **${amount} pesan**.` });
    }
    else if (sub === 'maxwarns') {
        const kick = interaction.options.getInteger('kick', true);
        const ban = interaction.options.getInteger('ban', true);
        if (ban <= kick) {
            await interaction.reply({ content: '❌ Batas ban harus lebih besar dari batas kick.', ephemeral: true });
            return;
        }
        (0, database_js_1.updateGuildSetting)(interaction.guildId, 'max_warns_kick', kick);
        (0, database_js_1.updateGuildSetting)(interaction.guildId, 'max_warns_ban', ban);
        await interaction.reply({
            content: `${index_js_1.config.emojis.check} Kick pada **${kick}** peringatan, Ban pada **${ban}** peringatan.`,
        });
    }
}
//# sourceMappingURL=setup.js.map