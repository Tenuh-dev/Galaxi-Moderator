import { GuildMember, PartialGuildMember, Events, EmbedBuilder, TextChannel } from 'discord.js';
import { config } from '../config/index.js';
import { getGuildSettings } from '../utils/database.js';

export const name = Events.GuildMemberRemove;
export const once = false;

export async function execute(member: GuildMember | PartialGuildMember): Promise<void> {
  const settings = getGuildSettings(member.guild.id);
  const logChannelId = settings.log_channel_id || config.logChannelId;
  if (!logChannelId) return;

  try {
    const logChannel = member.guild.channels.cache.get(logChannelId);
    if (!(logChannel instanceof TextChannel)) return;

    const embed = new EmbedBuilder()
      .setColor(config.colors.error)
      .setTitle('🚪 Member Keluar')
      .setThumbnail(member.user?.displayAvatarURL() || null)
      .addFields(
        { name: 'Pengguna', value: `${member.user?.tag || 'Unknown'} (${member.id})`, inline: true },
        { name: 'Total Member', value: String(member.guild.memberCount), inline: true }
      )
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error pada guildMemberRemove event:', error);
  }
}
