import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  token: process.env.DISCORD_BOT_TOKEN || '',
  prefix: process.env.BOT_PREFIX || '!',
  logChannelId: process.env.LOG_CHANNEL_ID || '',
  modRoleId: process.env.MOD_ROLE_ID || '',

  moderation: {
    maxWarnsBeforeKick: parseInt(process.env.MAX_WARNS_BEFORE_KICK || '3'),
    maxWarnsBeforeBan: parseInt(process.env.MAX_WARNS_BEFORE_BAN || '5'),
    muteDurationMinutes: parseInt(process.env.MUTE_DURATION_MINUTES || '10'),
    spamThreshold: parseInt(process.env.SPAM_THRESHOLD || '5'),
    spamIntervalMs: parseInt(process.env.SPAM_INTERVAL_MS || '5000'),
    maxMentions: parseInt(process.env.MAX_MENTIONS || '5'),
    timeoutDurationMs: 10 * 60 * 1000, // 10 minutes default timeout
  },

  colors: {
    success: 0x2ecc71,
    error: 0xe74c3c,
    warning: 0xf39c12,
    info: 0x3498db,
    mod: 0x9b59b6,
  },

  emojis: {
    shield: '🛡️',
    ban: '🔨',
    kick: '👟',
    mute: '🔇',
    warn: '⚠️',
    spam: '📵',
    phish: '🎣',
    toxic: '☣️',
    check: '✅',
    cross: '❌',
    bot: '🤖',
    star: '⭐',
  },
};

if (!config.token) {
  console.error('❌ DISCORD_BOT_TOKEN tidak ditemukan! Pastikan sudah diset di environment.');
  process.exit(1);
}
