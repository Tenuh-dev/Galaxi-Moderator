import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  GuildMember,
} from 'discord.js';
import { config } from '../config/index.js';
import { logModAction, sendModDM } from '../utils/modLogger.js';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban member dari server')
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addUserOption(opt =>
    opt.setName('user').setDescription('Member yang akan di-ban').setRequired(true)
  )
  .addStringOption(opt =>
    opt.setName('reason').setDescription('Alasan ban').setRequired(false)
  )
  .addIntegerOption(opt =>
    opt.setName('delete_days').setDescription('Hapus pesan berapa hari terakhir (0-7)').setMinValue(0).setMaxValue(7)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const target = interaction.options.getMember('user') as GuildMember;
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

  await sendModDM(target.user, 'ban', interaction.guild!.name, reason);
  await target.ban({ reason, deleteMessageSeconds: deleteDays * 86400 });

  await logModAction(interaction.guild!, 'ban', target.user, interaction.user, reason, {
    'Hapus Pesan': `${deleteDays} hari`,
  });

  const embed = new EmbedBuilder()
    .setColor(0x000000)
    .setTitle(`${config.emojis.ban} Member Dibanned`)
    .addFields(
      { name: 'Member', value: target.user.tag, inline: true },
      { name: 'Alasan', value: reason, inline: true },
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
