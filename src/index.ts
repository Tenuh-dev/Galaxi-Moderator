import {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  Events,
} from 'discord.js';
import { config } from './config/index.js';
import { ExtendedClient, BotCommand } from './types/index.js';

// Import events
import * as readyEvent from './events/ready.js';
import * as messageCreateEvent from './events/messageCreate.js';
import * as guildMemberAddEvent from './events/guildMemberAdd.js';
import * as guildMemberRemoveEvent from './events/guildMemberRemove.js';

// Import commands
import * as warnCmd from './commands/warn.js';
import * as warningsCmd from './commands/warnings.js';
import * as kickCmd from './commands/kick.js';
import * as banCmd from './commands/ban.js';
import * as timeoutCmd from './commands/timeout.js';
import * as purgeCmd from './commands/purge.js';
import * as setupCmd from './commands/setup.js';
import * as userinfoCmd from './commands/userinfo.js';
import * as helpCmd from './commands/help.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
  ],
}) as ExtendedClient;

client.commands = new Collection<string, BotCommand>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const allCommandModules: any[] = [
  warnCmd,
  warningsCmd,
  kickCmd,
  banCmd,
  timeoutCmd,
  purgeCmd,
  setupCmd,
  userinfoCmd,
  helpCmd,
];

for (const cmd of allCommandModules) {
  client.commands.set(cmd.data.name, cmd as BotCommand);
}

// Register events
const events = [
  readyEvent,
  messageCreateEvent,
  guildMemberAddEvent,
  guildMemberRemoveEvent,
];

for (const event of events) {
  if (event.once) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client.once(event.name, (...args: any[]) => (event.execute as (...a: any[]) => Promise<void>)(...args));
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client.on(event.name, (...args: any[]) => (event.execute as (...a: any[]) => Promise<void>)(...args));
  }
}

// Handler slash commands
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error pada command ${interaction.commandName}:`, error);
    const msg = { content: '❌ Terjadi kesalahan saat menjalankan perintah ini.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg).catch(() => {});
    } else {
      await interaction.reply(msg).catch(() => {});
    }
  }
});

async function registerCommands(): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(config.token);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const commandData = allCommandModules.map((cmd: any) => cmd.data.toJSON());

  try {
    console.log('📡 Mendaftarkan slash commands ke Discord...');
    const app = await rest.get(Routes.oauth2CurrentApplication()) as { id: string };
    await rest.put(Routes.applicationCommands(app.id), { body: commandData });
    console.log('✅ Slash commands berhasil didaftarkan!');
  } catch (error) {
    console.error('❌ Gagal mendaftarkan slash commands:', error);
  }
}

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

(async () => {
  await registerCommands();
  await client.login(config.token);
})();
