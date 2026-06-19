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
  .setName('kick')
  .setDescription('Kick member dari server')
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .addUserOption(opt =>
    opt.setName('user').setDescription('Member yang akan di-kick').setRequired(true)
  )
  .addStringOption(opt =>
    opt.setName('reason').setDescription('Alasan kick').setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const target = interaction.options.getMember('user') as GuildMember;
  const reason = interaction.options.getString('reason') || 'Tidak ada alasan';

  if (!target) {
    await interaction.reply({ content: '❌ Member tidak ditemukan.', ephemeral: true });
    return;
  }

  if (!target.kickable) {
    await interaction.reply({ content: '❌ Saya tidak bisa kick member ini.', ephemeral: true });
    return;
  }

  await sendModDM(target.user, 'kick', interaction.guild!.name, reason);
  await target.kick(reason);

  await logModAction(interaction.guild!, 'kick', target.user, interaction.user, reason);

  const embed = new EmbedBuilder()
    .setColor(config.colors.error)
    .setTitle(`${config.emojis.kick} Member Dikick`)
    .addFields(
      { name: 'Member', value: target.user.tag, inline: true },
      { name: 'Alasan', value: reason, inline: true },
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
