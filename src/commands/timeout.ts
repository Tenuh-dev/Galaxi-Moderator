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
  .setName('timeout')
  .setDescription('Timeout member (tidak bisa chat sementara)')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(opt =>
    opt.setName('user').setDescription('Member yang akan di-timeout').setRequired(true)
  )
  .addIntegerOption(opt =>
    opt.setName('duration').setDescription('Durasi timeout dalam menit').setRequired(true).setMinValue(1).setMaxValue(10080)
  )
  .addStringOption(opt =>
    opt.setName('reason').setDescription('Alasan timeout').setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const target = interaction.options.getMember('user') as GuildMember;
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

  await sendModDM(target.user, 'timeout', interaction.guild!.name, reason, `Durasi: **${durationMin} menit**`);
  await logModAction(interaction.guild!, 'timeout', target.user, interaction.user, reason, {
    'Durasi': `${durationMin} menit`,
  });

  const embed = new EmbedBuilder()
    .setColor(config.colors.warning)
    .setTitle(`⏱️ Member Di-timeout`)
    .addFields(
      { name: 'Member', value: target.user.tag, inline: true },
      { name: 'Durasi', value: `${durationMin} menit`, inline: true },
      { name: 'Alasan', value: reason, inline: false },
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
