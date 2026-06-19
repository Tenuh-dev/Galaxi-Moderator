import { Client, Events, ActivityType } from 'discord.js';
import { initDatabase } from '../utils/database.js';
import { config } from '../config/index.js';

export const name = Events.ClientReady;
export const once = true;

export async function execute(client: Client): Promise<void> {
  console.log(`\n${config.emojis.shield} ═══════════════════════════════════════`);
  console.log(`   GALAXI AUTO MODERATOR`);
  console.log(`${config.emojis.shield} ═══════════════════════════════════════`);
  console.log(`${config.emojis.check} Bot online sebagai: ${client.user?.tag}`);
  console.log(`${config.emojis.check} ID Bot: ${client.user?.id}`);
  console.log(`${config.emojis.check} Server aktif: ${client.guilds.cache.size}`);

  // Init database
  initDatabase();

  // Set activity/status
  client.user?.setPresence({
    activities: [
      {
        name: '🛡️ Menjaga Ketertiban | ketik "status bot"',
        type: ActivityType.Watching,
      },
    ],
    status: 'online',
  });

  // Register guild settings untuk semua server
  const { getGuildSettings } = await import('../utils/database.js');
  for (const [, guild] of client.guilds.cache) {
    getGuildSettings(guild.id);
    console.log(`${config.emojis.check} Terdaftar di server: ${guild.name} (${guild.memberCount} member)`);
  }

  console.log(`\n${config.emojis.shield} Galaxi Auto Moderator siap bertugas!`);
  console.log(`${config.emojis.shield} ═══════════════════════════════════════\n`);
}
