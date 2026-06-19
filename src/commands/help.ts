import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { config } from '../config/index.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Tampilkan semua fitur dan perintah Galaxi Moderator');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(config.colors.mod)
    .setTitle(`${config.emojis.shield} Galaxi Auto Moderator — Bantuan`)
    .setDescription('Bot auto moderasi canggih untuk menjaga ketertiban server Discord kamu.\n\u200b')
    .addFields(
      {
        name: `${config.emojis.toxic} Auto Moderasi (Otomatis)`,
        value: [
          '`Anti-Toxic` — Mendeteksi & menghapus kata kasar/toxic (ID + EN)',
          '`Anti-Phishing` — Mendeteksi link phishing/scam dan timeout 30 menit',
          '`Anti-Spam` — Mendeteksi flood dan spam pesan duplikat, timeout 5 menit',
          '`Anti-Tag Spam` — Mendeteksi spam mention/tag berlebihan',
          '`Auto-Kick/Ban` — Otomatis kick/ban saat peringatan penuh',
        ].join('\n'),
        inline: false,
      },
      {
        name: `${config.emojis.bot} Perintah Khusus (Chat)`,
        value: [
          '`bot` atau `status bot` — Lihat daftar semua bot aktif di server',
        ].join('\n'),
        inline: false,
      },
      {
        name: `${config.emojis.warn} Perintah Moderasi`,
        value: [
          '`/warn` — Beri peringatan ke member',
          '`/warnings list/clear/remove` — Kelola peringatan',
          '`/kick` — Kick member dari server',
          '`/ban` — Ban member dari server',
          '`/timeout` — Timeout member sementara',
          '`/purge` — Hapus banyak pesan sekaligus',
        ].join('\n'),
        inline: false,
      },
      {
        name: '⚙️ Perintah Admin',
        value: [
          '`/setup logchannel` — Set channel log moderasi',
          '`/setup status` — Lihat konfigurasi bot',
          '`/setup spamthreshold` — Set batas spam',
          '`/setup maxwarns` — Set batas peringatan kick/ban',
          '`/userinfo` — Lihat info + riwayat moderasi member',
        ].join('\n'),
        inline: false,
      },
      {
        name: '📋 Sistem Hukuman Otomatis',
        value: [
          '⚠️ Toxic / Phishing → **Hapus pesan + Timeout**',
          '⚠️ Spam → **Hapus pesan + Timeout 5 menit**',
          `⚠️ ${config.moderation.maxWarnsBeforeKick}x Peringatan → **Kick**`,
          `⚠️ ${config.moderation.maxWarnsBeforeBan}x Peringatan → **Ban permanen**`,
        ].join('\n'),
        inline: false,
      },
    )
    .setFooter({ text: 'Galaxi Auto Moderator | Jaga ketertiban bersama!', iconURL: interaction.client.user.displayAvatarURL() })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
