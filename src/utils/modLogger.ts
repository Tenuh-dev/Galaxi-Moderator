import { EmbedBuilder, Guild, TextChannel, User } from 'discord.js';
import { config } from '../config/index.js';
import { addModLog, getGuildSettings } from './database.js';

type ActionType = 'warn' | 'mute' | 'unmute' | 'kick' | 'ban' | 'delete' | 'timeout' | 'spam' | 'phishing' | 'toxic' | 'tag_spam';

const ACTION_COLORS: Record<ActionType, number> = {
  warn: config.colors.warning,
  mute: config.colors.warning,
  unmute: config.colors.success,
  kick: config.colors.error,
  ban: 0x000000,
  delete: config.colors.info,
  timeout: config.colors.warning,
  spam: config.colors.error,
  phishing: config.colors.error,
  toxic: config.colors.error,
  tag_spam: config.colors.warning,
};

const ACTION_LABELS: Record<ActionType, string> = {
  warn: `${config.emojis.warn} Peringatan`,
  mute: `${config.emojis.mute} Mute`,
  unmute: `${config.emojis.check} Unmute`,
  kick: `${config.emojis.kick} Kick`,
  ban: `${config.emojis.ban} Ban`,
  delete: `${config.emojis.cross} Hapus Pesan`,
  timeout: `⏱️ Timeout`,
  spam: `${config.emojis.spam} Spam Terdeteksi`,
  phishing: `${config.emojis.phish} Phishing Terdeteksi`,
  toxic: `${config.emojis.toxic} Konten Toxic`,
  tag_spam: `${config.emojis.warn} Spam Tag`,
};

export async function logModAction(
  guild: Guild,
  action: ActionType,
  targetUser: User,
  moderator: User,
  reason: string,
  extra?: Record<string, unknown>
): Promise<void> {
  addModLog(guild.id, action, targetUser.id, moderator.id, reason, extra);

  const settings = getGuildSettings(guild.id);
  const logChannelId = settings.log_channel_id || config.logChannelId;
  if (!logChannelId) return;

  try {
    const logChannel = guild.channels.cache.get(logChannelId);
    if (!logChannel || !(logChannel instanceof TextChannel)) return;

    const embed = new EmbedBuilder()
      .setTitle(ACTION_LABELS[action] || action.toUpperCase())
      .setColor(ACTION_COLORS[action] || config.colors.info)
      .addFields(
        { name: 'Pengguna', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
        { name: 'Moderator', value: `${moderator.tag}`, inline: true },
        { name: 'Alasan', value: reason, inline: false }
      )
      .setThumbnail(targetUser.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: 'Galaxi Auto Moderator', iconURL: guild.client.user?.displayAvatarURL() });

    if (extra) {
      for (const [key, value] of Object.entries(extra)) {
        if (value !== undefined && value !== null) {
          embed.addFields({ name: key, value: String(value), inline: true });
        }
      }
    }

    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error saat mengirim log moderasi:', error);
  }
}

export async function sendModDM(
  user: User,
  action: ActionType,
  guildName: string,
  reason: string,
  extra?: string
): Promise<void> {
  try {
    const embed = new EmbedBuilder()
      .setTitle(`${ACTION_LABELS[action]} di Server ${guildName}`)
      .setColor(ACTION_COLORS[action] || config.colors.info)
      .addFields({ name: 'Alasan', value: reason })
      .setTimestamp()
      .setFooter({ text: 'Galaxi Auto Moderator' });

    if (extra) embed.setDescription(extra);

    await user.send({ embeds: [embed] });
  } catch {
    // User menonaktifkan DM
  }
}
