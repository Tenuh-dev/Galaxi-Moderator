import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  GuildMember,
} from 'discord.js';
import { config } from '../config/index.js';
import { addWarn, getWarnCount, getWarns } from '../utils/database.js';
import { logModAction, sendModDM } from '../utils/modLogger.js';

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Beri peringatan kepada member')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(opt =>
    opt.setName('user').setDescription('Member yang akan diperingati').setRequired(true)
  )
  .addStringOption(opt =>
    opt.setName('reason').setDescription('Alasan peringatan').setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const target = interaction.options.getMember('user') as GuildMember;
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

  const warnId = addWarn(interaction.guildId!, target.user.id, interaction.user.id, reason);
  const warnCount = getWarnCount(interaction.guildId!, target.user.id);

  await sendModDM(target.user, 'warn', interaction.guild!.name, reason, `Ini peringatan ke-**${warnCount}** kamu.`);

  await logModAction(
    interaction.guild!,
    'warn',
    target.user,
    interaction.user,
    reason,
    { 'ID Peringatan': String(warnId), 'Total Peringatan': String(warnCount) }
  );

  const embed = new EmbedBuilder()
    .setColor(config.colors.warning)
    .setTitle(`${config.emojis.warn} Peringatan Diberikan`)
    .addFields(
      { name: 'Member', value: `${target.user.tag}`, inline: true },
      { name: 'Alasan', value: reason, inline: true },
      { name: 'Total Peringatan', value: String(warnCount), inline: true },
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
