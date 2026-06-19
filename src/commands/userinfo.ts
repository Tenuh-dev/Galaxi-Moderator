import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
} from 'discord.js';
import { config } from '../config/index.js';
import { getWarnCount, getWarns } from '../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Lihat informasi dan riwayat moderasi member')
  .addUserOption(opt =>
    opt.setName('user').setDescription('Member yang ingin dilihat').setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const target = (interaction.options.getMember('user') as GuildMember) || interaction.member as GuildMember;

  if (!target) {
    await interaction.reply({ content: '❌ Member tidak ditemukan.', ephemeral: true });
    return;
  }

  const warnCount = getWarnCount(interaction.guildId!, target.user.id);
  const warns = getWarns(interaction.guildId!, target.user.id);
  const lastWarn = warns[0];

  const roles = target.roles.cache
    .filter(r => r.id !== interaction.guildId)
    .sort((a, b) => b.position - a.position)
    .first(5)
    .map(r => `<@&${r.id}>`)
    .join(', ') || 'Tidak ada';

  const embed = new EmbedBuilder()
    .setColor(config.colors.info)
    .setTitle(`👤 Info Member: ${target.user.tag}`)
    .setThumbnail(target.user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: 'Username', value: target.user.tag, inline: true },
      { name: 'ID', value: target.user.id, inline: true },
      { name: 'Bot?', value: target.user.bot ? 'Ya' : 'Tidak', inline: true },
      { name: 'Bergabung Server', value: `<t:${Math.floor((target.joinedTimestamp || 0) / 1000)}:R>`, inline: true },
      { name: 'Akun Dibuat', value: `<t:${Math.floor(target.user.createdTimestamp / 1000)}:R>`, inline: true },
      { name: 'Nickname', value: target.nickname || 'Tidak ada', inline: true },
      { name: 'Top 5 Role', value: roles, inline: false },
      { name: `${config.emojis.warn} Total Peringatan`, value: String(warnCount), inline: true },
      { name: 'Peringatan Terakhir', value: lastWarn ? `<t:${Math.floor(lastWarn.timestamp / 1000)}:R>` : 'Tidak ada', inline: true },
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
