import { Message, GuildMember, EmbedBuilder, TextChannel } from 'discord.js';
import { config } from '../config/index.js';
import { containsToxicWord, isPhishingLink, INVITE_PATTERN } from '../utils/toxicPatterns.js';
import { detectSpam, handleSpam } from './spamDetector.js';
import { logModAction, sendModDM } from '../utils/modLogger.js';
import { addWarn, getWarnCount, getGuildSettings } from '../utils/database.js';

function getTextChannel(message: Message): TextChannel | null {
  if (message.channel instanceof TextChannel) return message.channel;
  return null;
}

export async function runAutoMod(message: Message): Promise<void> {
  if (!message.guild || !message.member || message.author.bot) return;
  if (message.member.permissions.has('Administrator')) return;
  if (message.member.permissions.has('ManageMessages')) return;

  const content = message.content;

  // 1. Cek spam
  const spamResult = await detectSpam(message);
  if (spamResult.isSpam) {
    await handleSpam(message, spamResult.type);
    await logModAction(
      message.guild,
      spamResult.type === 'tag_spam' ? 'tag_spam' : 'spam',
      message.author,
      message.client.user!,
      `Auto-Mod: ${spamResult.type}`,
      { channel: message.channel.toString() }
    );
    return;
  }

  // 2. Cek phishing
  const phishResult = isPhishingLink(content);
  if (phishResult.isPhishing) {
    await handlePhishing(message, phishResult.url, phishResult.reason);
    return;
  }

  // 3. Cek invite Discord tidak sah
  if (INVITE_PATTERN.test(content)) {
    INVITE_PATTERN.lastIndex = 0;
    if (!message.member.permissions.has('ManageGuild')) {
      await handleUnauthorizedInvite(message);
      return;
    }
  }
  INVITE_PATTERN.lastIndex = 0;

  // 4. Cek kata toxic
  const toxicResult = containsToxicWord(content);
  if (toxicResult.found) {
    await handleToxic(message, toxicResult.word, toxicResult.category);
    return;
  }
}

async function handlePhishing(message: Message, url: string, reason: string): Promise<void> {
  if (!message.guild || !message.member) return;
  const ch = getTextChannel(message);

  try {
    await message.delete().catch(() => {});

    const member = message.member as GuildMember;
    await sendModDM(message.author, 'phishing', message.guild.name, reason,
      `Link yang kamu kirim terindikasi phishing: \`${url.substring(0, 60)}\``);

    if (member.moderatable) {
      await member.timeout(30 * 60 * 1000, `Auto-Mod: Phishing - ${reason}`);
    }

    addWarn(message.guild.id, message.author.id, message.client.user!.id, `Phishing: ${reason}`);
    const warnCount = getWarnCount(message.guild.id, message.author.id);

    await logModAction(message.guild, 'phishing', message.author, message.client.user!, reason,
      { url: url.substring(0, 100), warns: String(warnCount) });

    if (ch) {
      const embed = new EmbedBuilder()
        .setColor(config.colors.error)
        .setTitle(`${config.emojis.phish} Phishing Terdeteksi!`)
        .setDescription(`<@${message.author.id}> mengirimkan link phishing dan telah di-timeout 30 menit.\n\n**Peringatan:** Jangan klik link mencurigakan!`)
        .setTimestamp();
      const warning = await ch.send({ embeds: [embed] });
      setTimeout(() => warning.delete().catch(() => {}), 15000);
    }

    await checkWarnThreshold(message, warnCount);
  } catch (error) {
    console.error('Error saat handle phishing:', error);
  }
}

async function handleUnauthorizedInvite(message: Message): Promise<void> {
  if (!message.guild || !message.member) return;
  const ch = getTextChannel(message);

  try {
    await message.delete().catch(() => {});
    if (ch) {
      const warning = await ch.send({
        content: `${config.emojis.warn} <@${message.author.id}> Mengirim invite Discord tidak diizinkan di server ini! Pesan dihapus.`,
      });
      setTimeout(() => warning.delete().catch(() => {}), 8000);
    }

    await logModAction(message.guild, 'delete', message.author, message.client.user!,
      'Mengirim invite Discord tanpa izin', { channel: message.channel.toString() });
  } catch (error) {
    console.error('Error saat handle invite:', error);
  }
}

async function handleToxic(message: Message, word: string, category: string): Promise<void> {
  if (!message.guild || !message.member) return;
  const ch = getTextChannel(message);

  try {
    await message.delete().catch(() => {});
    const member = message.member as GuildMember;

    addWarn(message.guild.id, message.author.id, message.client.user!.id, `Konten toxic (${category})`);
    const warnCount = getWarnCount(message.guild.id, message.author.id);

    if (member.moderatable) {
      await member.timeout(config.moderation.timeoutDurationMs, `Auto-Mod: Konten toxic`);
    }

    await sendModDM(message.author, 'toxic', message.guild.name, `Konten toxic terdeteksi (${category})`,
      `Pesan kamu dihapus karena mengandung konten yang tidak pantas. Ini peringatan ke-**${warnCount}**.`);

    await logModAction(message.guild, 'toxic', message.author, message.client.user!, `Konten toxic: ${category}`,
      { warns: String(warnCount), channel: message.channel.toString() });

    if (ch) {
      const embed = new EmbedBuilder()
        .setColor(config.colors.warning)
        .setTitle(`${config.emojis.toxic} Konten Tidak Pantas Dihapus`)
        .setDescription(`<@${message.author.id}> pesan kamu dihapus karena mengandung kata yang tidak pantas.\n**Peringatan: ${warnCount}**`)
        .setTimestamp();
      const warning = await ch.send({ embeds: [embed] });
      setTimeout(() => warning.delete().catch(() => {}), 8000);
    }

    await checkWarnThreshold(message, warnCount);
  } catch (error) {
    console.error('Error saat handle toxic:', error);
  }
}

async function checkWarnThreshold(message: Message, warnCount: number): Promise<void> {
  if (!message.guild || !message.member) return;
  const ch = getTextChannel(message);

  const settings = getGuildSettings(message.guild.id);
  const maxWarnsKick = settings.max_warns_kick ?? config.moderation.maxWarnsBeforeKick;
  const maxWarnsBan = settings.max_warns_ban ?? config.moderation.maxWarnsBeforeBan;
  const member = message.member as GuildMember;

  if (warnCount >= maxWarnsBan) {
    if (member.bannable) {
      await sendModDM(message.author, 'ban', message.guild.name, `Mencapai batas peringatan maksimum (${warnCount})`);
      await member.ban({ reason: `Auto-Mod: Mencapai ${warnCount} peringatan`, deleteMessageSeconds: 86400 });
      await logModAction(message.guild, 'ban', message.author, message.client.user!, `Auto-ban: ${warnCount} peringatan`);
      if (ch) await ch.send({ content: `${config.emojis.ban} <@${message.author.id}> telah di-**BAN** karena mencapai batas peringatan maksimum (${warnCount}).` });
    }
  } else if (warnCount >= maxWarnsKick) {
    if (member.kickable) {
      await sendModDM(message.author, 'kick', message.guild.name, `Mencapai batas peringatan (${warnCount})`);
      await member.kick(`Auto-Mod: Mencapai ${warnCount} peringatan`);
      await logModAction(message.guild, 'kick', message.author, message.client.user!, `Auto-kick: ${warnCount} peringatan`);
      if (ch) await ch.send({ content: `${config.emojis.kick} <@${message.author.id}> telah di-**KICK** karena mencapai batas peringatan (${warnCount}).` });
    }
  }
}
