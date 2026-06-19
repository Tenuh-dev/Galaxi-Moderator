const {
  PermissionsBitField,
  EmbedBuilder
} = require("discord.js");

const config = require("../config/config");

const {
  isToxic,
  isPhishing,
  isSpam,
  isMentionSpam,
  containsSuspiciousLink
} = require("../utils/moderation");

const {
  addWarning,
  getWarningCount
} = require("../utils/warningManager");

module.exports = (client) => {

  client.on("messageCreate", async (message) => {

    if (!message.guild) return;
    if (message.author.bot) return;

    const member = message.member;

    // Bypass Admin
    if (
      member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) return;

    const content = message.content.toLowerCase();

    // =========================
    // STATUS BOT
    // =========================

    if (
      content === "bot" ||
      content === "status bot"
    ) {

      const bots = message.guild.members.cache.filter(
        member => member.user.bot
      );

      const botList = bots.map(
        bot => `• ${bot.user.username}`
      ).join("\n");

      const embed = new EmbedBuilder()
        .setTitle("🤖 Status Bot Server")
        .setDescription(
          botList || "Tidak ada bot."
        )
        .setTimestamp();

      return message.reply({
        embeds: [embed]
      });
    }

    // =========================
    // DETEKSI PELANGGARAN
    // =========================

    let violation = null;

    if (isToxic(content)) {
      violation = "Toxic Language";
    }

    else if (isPhishing(content)) {
      violation = "Phishing Attempt";
    }

    else if (containsSuspiciousLink(content)) {
      violation = "Suspicious Link";
    }

    else if (
      isMentionSpam(
        message,
        config.mentionSpam.maxMentions
      )
    ) {
      violation = "Mention Spam";
    }

    else if (
      isSpam(
        message.author.id,
        config.spam.interval,
        config.spam.maxMessages
      )
    ) {
      violation = "Chat Spam";
    }

    if (!violation) return;

    try {

      await message.delete().catch(() => {});

      const warningCount =
        addWarning(message.author.id);

      const logChannel =
        message.guild.channels.cache.get(
          config.logChannelId
        );

      const embed =
        new EmbedBuilder()
          .setTitle("🚨 Pelanggaran Terdeteksi")
          .addFields(
            {
              name: "User",
              value: `${message.author.tag}`
            },
            {
              name: "Pelanggaran",
              value: violation
            },
            {
              name: "Warning",
              value: `${warningCount}/3`
            }
          )
          .setTimestamp();

      // Kirim ke Channel Log
      if (logChannel) {
        await logChannel.send({
          embeds: [embed]
        });
      }

      // Kirim ke User
      await message.author.send(
        `⚠️ Kamu mendapat warning karena: ${violation}\n\nWarning: ${warningCount}/3`
      ).catch(() => {});

      // ======================
      // AUTO TIMEOUT
      // ======================

      if (
        warningCount >=
        config.punishments.warnLimit
      ) {

        const timeoutMs =
          config.punishments.timeoutMinutes *
          60 *
          1000;

        await member.timeout(
          timeoutMs,
          "Reached warning limit"
        );

        if (logChannel) {

          const timeoutEmbed =
            new EmbedBuilder()
              .setTitle("🔨 Auto Timeout")
              .setDescription(
                `${message.author.tag} mencapai batas warning.`
              )
              .addFields({
                name: "Durasi",
                value: `${config.punishments.timeoutMinutes} menit`
              })
              .setTimestamp();

          await logChannel.send({
            embeds: [timeoutEmbed]
          });
        }
      }

    } catch (error) {

      console.error(
        "Moderation Error:",
        error
      );

    }

  });

};
        
