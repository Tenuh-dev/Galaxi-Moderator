"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const index_js_1 = require("../config/index.js");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('help')
    .setDescription('Tampilkan semua fitur dan perintah Galaxi Moderator');
async function execute(interaction) {
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(index_js_1.config.colors.mod)
        .setTitle(`${index_js_1.config.emojis.shield} Galaxi Auto Moderator — Bantuan`)
        .setDescription('Bot auto moderasi canggih untuk menjaga ketertiban server Discord kamu.\n\u200b')
        .addFields({
        name: `${index_js_1.config.emojis.toxic} Auto Moderasi (Otomatis)`,
        value: [
            '`Anti-Toxic` — Mendeteksi & menghapus kata kasar/toxic (ID + EN)',
            '`Anti-Phishing` — Mendeteksi link phishing/scam dan timeout 30 menit',
            '`Anti-Spam` — Mendeteksi flood dan spam pesan duplikat, timeout 5 menit',
            '`Anti-Tag Spam` — Mendeteksi spam mention/tag berlebihan',
            '`Auto-Kick/Ban` — Otomatis kick/ban saat peringatan penuh',
        ].join('\n'),
        inline: false,
    }, {
        name: `${index_js_1.config.emojis.bot} Perintah Khusus (Chat)`,
        value: [
            '`bot` atau `status bot` — Lihat daftar semua bot aktif di server',
        ].join('\n'),
        inline: false,
    }, {
        name: `${index_js_1.config.emojis.warn} Perintah Moderasi`,
        value: [
            '`/warn` — Beri peringatan ke member',
            '`/warnings list/clear/remove` — Kelola peringatan',
            '`/kick` — Kick member dari server',
            '`/ban` — Ban member dari server',
            '`/timeout` — Timeout member sementara',
            '`/purge` — Hapus banyak pesan sekaligus',
        ].join('\n'),
        inline: false,
    }, {
        name: '⚙️ Perintah Admin',
        value: [
            '`/setup logchannel` — Set channel log moderasi',
            '`/setup status` — Lihat konfigurasi bot',
            '`/setup spamthreshold` — Set batas spam',
            '`/setup maxwarns` — Set batas peringatan kick/ban',
            '`/userinfo` — Lihat info + riwayat moderasi member',
        ].join('\n'),
        inline: false,
    }, {
        name: '📋 Sistem Hukuman Otomatis',
        value: [
            '⚠️ Toxic / Phishing → **Hapus pesan + Timeout**',
            '⚠️ Spam → **Hapus pesan + Timeout 5 menit**',
            `⚠️ ${index_js_1.config.moderation.maxWarnsBeforeKick}x Peringatan → **Kick**`,
            `⚠️ ${index_js_1.config.moderation.maxWarnsBeforeBan}x Peringatan → **Ban permanen**`,
        ].join('\n'),
        inline: false,
    })
        .setFooter({ text: 'Galaxi Auto Moderator | Jaga ketertiban bersama!', iconURL: interaction.client.user.displayAvatarURL() })
        .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
}
//# sourceMappingURL=help.js.map