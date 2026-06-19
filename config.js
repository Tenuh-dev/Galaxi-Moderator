require("dotenv").config();

module.exports = {
  token: process.env.TOKEN,
  logChannelId: process.env.LOG_CHANNEL_ID,
  botName: process.env.BOT_NAME || "Auto Moderator",

  punishments: {
    warnLimit: 3,
    timeoutMinutes: 10
  },

  spam: {
    maxMessages: 5,
    interval: 5000
  },

  mentionSpam: {
    maxMentions: 5
  }
};
