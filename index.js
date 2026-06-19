const {
  Client,
  GatewayIntentBits,
  Partials,
  ActivityType
} = require("discord.js");

const config = require("./config/config");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.GuildMember
  ]
});

client.once("ready", async () => {
  console.log(`✅ ${config.botName} Online`);
  console.log(`🤖 Login sebagai ${client.user.tag}`);

  client.user.setPresence({
    activities: [
      {
        name: "Menjaga Community 🛡️",
        type: ActivityType.Watching
      }
    ],
    status: "online"
  });
});

require("./events/messageCreate")(client);

console.log("TOKEN ADA:", !!config.token);
console.log("BOT NAME:", config.botName);

client.login(config.token);
