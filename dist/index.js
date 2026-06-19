"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_js_1 = require("./config/index.js");
// Import events
const readyEvent = __importStar(require("./events/ready.js"));
const messageCreateEvent = __importStar(require("./events/messageCreate.js"));
const guildMemberAddEvent = __importStar(require("./events/guildMemberAdd.js"));
const guildMemberRemoveEvent = __importStar(require("./events/guildMemberRemove.js"));
// Import commands
const warnCmd = __importStar(require("./commands/warn.js"));
const warningsCmd = __importStar(require("./commands/warnings.js"));
const kickCmd = __importStar(require("./commands/kick.js"));
const banCmd = __importStar(require("./commands/ban.js"));
const timeoutCmd = __importStar(require("./commands/timeout.js"));
const purgeCmd = __importStar(require("./commands/purge.js"));
const setupCmd = __importStar(require("./commands/setup.js"));
const userinfoCmd = __importStar(require("./commands/userinfo.js"));
const helpCmd = __importStar(require("./commands/help.js"));
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.GuildPresences,
        discord_js_1.GatewayIntentBits.GuildModeration,
        discord_js_1.GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [
        discord_js_1.Partials.Message,
        discord_js_1.Partials.Channel,
        discord_js_1.Partials.GuildMember,
    ],
});
client.commands = new discord_js_1.Collection();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const allCommandModules = [
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
    client.commands.set(cmd.data.name, cmd);
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
        client.once(event.name, (...args) => event.execute(...args));
    }
    else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        client.on(event.name, (...args) => event.execute(...args));
    }
}
// Handler slash commands
client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    const command = client.commands.get(interaction.commandName);
    if (!command)
        return;
    try {
        await command.execute(interaction);
    }
    catch (error) {
        console.error(`Error pada command ${interaction.commandName}:`, error);
        const msg = { content: '❌ Terjadi kesalahan saat menjalankan perintah ini.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(msg).catch(() => { });
        }
        else {
            await interaction.reply(msg).catch(() => { });
        }
    }
});
async function registerCommands() {
    const rest = new discord_js_1.REST({ version: '10' }).setToken(index_js_1.config.token);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const commandData = allCommandModules.map((cmd) => cmd.data.toJSON());
    try {
        console.log('📡 Mendaftarkan slash commands ke Discord...');
        const app = await rest.get(discord_js_1.Routes.oauth2CurrentApplication());
        await rest.put(discord_js_1.Routes.applicationCommands(app.id), { body: commandData });
        console.log('✅ Slash commands berhasil didaftarkan!');
    }
    catch (error) {
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
    await client.login(index_js_1.config.token);
})();
//# sourceMappingURL=index.js.map