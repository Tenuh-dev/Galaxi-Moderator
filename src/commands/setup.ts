import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  TextChannel,
} from 'discord.js';
import { config } from '../config/index.js';
import { updateGuildSetting, getGuildSettings } from '../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('setup')
  .setDescription('Konfigurasi Galaxi Moderator untuk server ini')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand(sub =>
    sub.setName('logchannel')
      .setDescription('Set channel untuk log moderasi')
      .addChannelOption(opt =>
        opt.setName('channel').setDescription('Channel log').setRequired(true)
          .addChannelTypes(ChannelType.GuildText)
      )
  )
  .addSubcommand(sub =>
    sub.setName('status')
      .setDescription('Lihat konfigurasi saat ini')
  )
  .addSubcommand(sub =>
    sub.setName('spamthreshold')
      .setDescription('Set batas pesan spam (default: 5 pesan / 5 detik)')
      .addIntegerOption(opt =>
        opt.setName('amount').setDescription('Jumlah pesan').setRequired(true).setMinValue(3).setMaxValue(20)
      )
  )
  .addSubcommand(sub =>
    sub.setName('maxwarns')
      .setDescription('Set batas peringatan sebelum kick/ban')
      .addIntegerOption(opt =>
        opt.setName('kick').setDescription('Peringatan sebelum kick').setRequired(true).setMinValue(1).setMaxValue(10)
      )
      .addIntegerOption(opt =>
        opt.setName('ban').setDescription('Peringatan sebelum ban').setRequired(true).setMinValue(2).setMaxValue(15)
      )
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const sub = interaction.options.getSubcommand();

  if (sub === 'logchannel') {
    const channel = interaction.options.getChannel('channel', true);
    updateGuildSetting(interaction.guildId!, 'log_channel_id', channel.id);
    await interaction.reply({
      content: `${config.emojis.check} Channel log moderasi berhasil diset ke <#${channel.id}>.`,
    });

  } else if (sub === 'status') {
    const settings = getGuildSettings(interaction.guildId!);

    const embed = new EmbedBuilder()
      .setColor(config.colors.info)
      .setTitle(`${config.emojis.shield} Konfigurasi Galaxi Moderator`)
      .addFields(
        { name: 'Log Channel', value: settings.log_channel_id ? `<#${settings.log_channel_id}>` : 'Belum diset', inline: true },
        { name: 'Auto-Mod', value: settings.auto_mod_enabled ? '✅ Aktif' : '❌ Nonaktif', inline: true },
        { name: 'Spam Threshold', value: `${settings.spam_threshold || 5} pesan / ${(settings.spam_interval_ms || 5000) / 1000}s`, inline: true },
        { name: 'Max Warn → Kick', value: String(settings.max_warns_kick || 3), inline: true },
        { name: 'Max Warn → Ban', value: String(settings.max_warns_ban || 5), inline: true },
        { name: 'Max Mention', value: String(settings.max_mentions || 5), inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });

  } else if (sub === 'spamthreshold') {
    const amount = interaction.options.getInteger('amount', true);
    updateGuildSetting(interaction.guildId!, 'spam_threshold', amount);
    await interaction.reply({ content: `${config.emojis.check} Batas spam diset ke **${amount} pesan**.` });

  } else if (sub === 'maxwarns') {
    const kick = interaction.options.getInteger('kick', true);
    const ban = interaction.options.getInteger('ban', true);

    if (ban <= kick) {
      await interaction.reply({ content: '❌ Batas ban harus lebih besar dari batas kick.', ephemeral: true });
      return;
    }

    updateGuildSetting(interaction.guildId!, 'max_warns_kick', kick);
    updateGuildSetting(interaction.guildId!, 'max_warns_ban', ban);
    await interaction.reply({
      content: `${config.emojis.check} Kick pada **${kick}** peringatan, Ban pada **${ban}** peringatan.`,
    });
  }
}
