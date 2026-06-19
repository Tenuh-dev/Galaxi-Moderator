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
exports.config = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
exports.config = {
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
if (!exports.config.token) {
    console.error('❌ DISCORD_BOT_TOKEN tidak ditemukan! Pastikan sudah diset di environment.');
    process.exit(1);
}
//# sourceMappingURL=index.js.map