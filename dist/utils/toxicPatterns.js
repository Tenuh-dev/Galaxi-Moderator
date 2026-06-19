"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.URL_PATTERN = exports.INVITE_PATTERN = exports.PHISHING_URL_PATTERNS = exports.KNOWN_PHISHING_DOMAINS = exports.TOXIC_PATTERNS = exports.TOXIC_WORDS_EN = exports.TOXIC_WORDS_ID = void 0;
exports.containsToxicWord = containsToxicWord;
exports.isPhishingLink = isPhishingLink;
// Kata-kata toxic / kasar dalam Bahasa Indonesia dan Inggris
exports.TOXIC_WORDS_ID = [
    // Makian umum
    'anjing', 'anjir', 'bajingan', 'brengsek', 'bangsat', 'kampret',
    'keparat', 'jancok', 'dancok', 'kontol', 'memek', 'ngentot',
    'tai', 'taik', 'setan', 'iblis', 'babi', 'asu', 'asuw',
    'tolol', 'bodoh', 'goblok', 'dungu', 'idiot', 'bego',
    'sialan', 'celaka', 'laknat', 'bedebah', 'kurang ajar',
    // Variasi dengan angka/huruf
    'anj1ng', 'b4jing4n', 'k0ntol', 'ng3ntot',
];
exports.TOXIC_WORDS_EN = [
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn',
    'cunt', 'dick', 'pussy', 'whore', 'slut', 'retard',
    'nigga', 'nigger', 'faggot', 'fag', 'gay', 'idiot',
];
// Pola-pola berbahaya
exports.TOXIC_PATTERNS = [
    // Ancaman
    {
        pattern: /\b(aku|saya|gue|gw)\s*(akan|mau|bakal)\s*(bunuh|matiin|hajar|pukul|tonjok)\b/gi,
        category: 'threat',
        severity: 'high',
    },
    {
        pattern: /\b(i('?ll|'? will)?|gonna|going to)\s+(kill|hurt|beat|attack|destroy)\s+(you|u|ur)\b/gi,
        category: 'threat',
        severity: 'high',
    },
    // Diskriminasi SARA
    {
        pattern: /\b(kafir|kufur|murtad)\s*(harus|pantas)\s*(mati|dibunuh|dibasmi)\b/gi,
        category: 'hate_speech',
        severity: 'high',
    },
    {
        pattern: /\b(chinese?|cina|china)\s*(babi|anjing|monyet|keluar)\b/gi,
        category: 'hate_speech',
        severity: 'high',
    },
    // Kata kasar panjang
    {
        pattern: /[a@4][sṣ$][sṣ$]h[o0][lḷ][e€3]/gi,
        category: 'profanity',
        severity: 'medium',
    },
    // Konten seksual eksplisit
    {
        pattern: /\b(porn|porno|xxx|onlyfans|bokep|seks)\b/gi,
        category: 'explicit',
        severity: 'medium',
    },
];
// Domain phishing umum
exports.KNOWN_PHISHING_DOMAINS = [
    'discordnitro-free.com',
    'free-nitro.com',
    'discord-gift.com',
    'steamcommunity.ru',
    'steamcommunitv.com',
    'store.steampowerd.com',
    'discordapp.gifts',
    'discord.gift.to',
    'nitro-giveaway.com',
    'free-discord-nitro.net',
    'get-nitro.gift',
    'claimnitro.com',
    'discordnitrogift.xyz',
    'discord-nitro.xyz',
    'discordfree.store',
    'dlscord.com',
    'discordl.com',
    'steamcornmunity.com',
    'csgoatse.com',
    'csgobig.gg',
];
// Pola URL phishing
exports.PHISHING_URL_PATTERNS = [
    /discord[\._\-]?nitro[\._\-]?free/gi,
    /free[\._\-]?nitro[\._\-]?discord/gi,
    /steam[\._\-]?community\.[^com]/gi,
    /discord[\._\-]?gift\.[^com]/gi,
    /get[\._\-]?nitro/gi,
    /claim[\._\-]?nitro/gi,
    /discord\.[a-z]{2,5}\/(?!com|gg|js|py|net|org)/gi,
];
// Pola spam invite
exports.INVITE_PATTERN = /discord\.gg\/[a-zA-Z0-9]+|discord\.com\/invite\/[a-zA-Z0-9]+/gi;
// Pola URL umum
exports.URL_PATTERN = /https?:\/\/[^\s]+/gi;
// Fungsi pengecekan toxic
function containsToxicWord(text) {
    const lower = text.toLowerCase().replace(/\s+/g, ' ');
    for (const word of exports.TOXIC_WORDS_ID) {
        const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        if (pattern.test(lower)) {
            return { found: true, word, category: 'profanity_id' };
        }
    }
    for (const word of exports.TOXIC_WORDS_EN) {
        const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        if (pattern.test(lower)) {
            return { found: true, word, category: 'profanity_en' };
        }
    }
    for (const pattern of exports.TOXIC_PATTERNS) {
        if (pattern.pattern.test(text)) {
            pattern.pattern.lastIndex = 0;
            return { found: true, word: pattern.category, category: pattern.category };
        }
    }
    return { found: false, word: '', category: '' };
}
// Fungsi cek phishing
function isPhishingLink(text) {
    const urls = text.match(exports.URL_PATTERN) || [];
    for (const url of urls) {
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname.toLowerCase();
            // Cek domain phishing yang diketahui
            for (const domain of exports.KNOWN_PHISHING_DOMAINS) {
                if (hostname === domain || hostname.endsWith('.' + domain)) {
                    return { isPhishing: true, url, reason: `Domain phishing terdeteksi: ${domain}` };
                }
            }
            // Cek pola URL phishing
            for (const pattern of exports.PHISHING_URL_PATTERNS) {
                if (pattern.test(url)) {
                    pattern.lastIndex = 0;
                    return { isPhishing: true, url, reason: 'Pola URL mencurigakan terdeteksi' };
                }
            }
            // Cek domain Discord palsu
            if (hostname.includes('discord') && !['discord.com', 'discord.gg', 'discord.js.org', 'discordapp.com'].includes(hostname)) {
                return { isPhishing: true, url, reason: 'Domain Discord palsu terdeteksi' };
            }
            // Cek domain Steam palsu
            if (hostname.includes('steam') && !['steampowered.com', 'steamcommunity.com', 'store.steampowered.com'].includes(hostname)) {
                return { isPhishing: true, url, reason: 'Domain Steam palsu terdeteksi' };
            }
        }
        catch {
            // URL tidak valid, skip
        }
    }
    return { isPhishing: false, url: '', reason: '' };
}
//# sourceMappingURL=toxicPatterns.js.map