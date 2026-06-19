import { GuildMember, Events, EmbedBuilder, TextChannel } from 'discord.js';
import { config } from '../config/index.js';
import { getGuildSettings } from '../utils/database.js';

export const name = Events.GuildMemberAdd;
export const once = false;

export async function execute(member: GuildMember): Promise<void> {
  const settings = getGuildSettings(member.guild.id);
  const logChannelId = settings.log_channel_id || config.logChannelId;
  if (!logChannelId) return;

  try {
    const logChannel = member.guild.channels.cache.get(logChannelId);
    if (!(logChannel instanceof TextChannel)) return;

    const embed = new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle('👋 Member Baru Bergabung')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'Pengguna', value: `${member.user.tag} (${member.user.id})`, inline: true },
        { name: 'Akun Dibuat', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Total Member', value: String(member.guild.memberCount), inline: true }
      )
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error pada guildMemberAdd event:', error);
  }
}
