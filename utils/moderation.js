const spamCache = new Map();

const toxicWords = [
  "anjing",
  "bangsat",
  "kontol",
  "memek",
  "goblok",
  "tolol",
  "babi",
  "asu",
  "ngentot",
  "jancok"
];

const phishingKeywords = [
  "free nitro",
  "discord.gift",
  "claim reward",
  "claim now",
  "free robux",
  "free diamond",
  "verify account",
  "steam gift",
  "login discord",
  "free skin"
];

function isToxic(content) {
  const text = content.toLowerCase();

  return toxicWords.some(word =>
    text.includes(word)
  );
}

function isPhishing(content) {
  const text = content.toLowerCase();

  return phishingKeywords.some(keyword =>
    text.includes(keyword)
  );
}

function isMentionSpam(message, maxMentions = 5) {
  return message.mentions.users.size >= maxMentions;
}

function isSpam(userId, interval = 5000, maxMessages = 5) {
  const now = Date.now();

  if (!spamCache.has(userId)) {
    spamCache.set(userId, []);
  }

  const messages = spamCache.get(userId);

  messages.push(now);

  const filtered = messages.filter(
    time => now - time < interval
  );

  spamCache.set(userId, filtered);

  return filtered.length >= maxMessages;
}

function containsSuspiciousLink(content) {
  const regex =
    /(https?:\/\/[^\s]+)/gi;

  const links = content.match(regex);

  if (!links) return false;

  return links.some(link => {
    const lower = link.toLowerCase();

    return (
      lower.includes("discord-gift") ||
      lower.includes("free-nitro") ||
      lower.includes("steamgift") ||
      lower.includes("claimreward")
    );
  });
}

module.exports = {
  isToxic,
  isPhishing,
  isSpam,
  isMentionSpam,
  containsSuspiciousLink
};
      
