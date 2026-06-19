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
exports.once = exports.name = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const database_js_1 = require("../utils/database.js");
const index_js_1 = require("../config/index.js");
exports.name = discord_js_1.Events.ClientReady;
exports.once = true;
async function execute(client) {
    console.log(`\n${index_js_1.config.emojis.shield} ═══════════════════════════════════════`);
    console.log(`   GALAXI AUTO MODERATOR`);
    console.log(`${index_js_1.config.emojis.shield} ═══════════════════════════════════════`);
    console.log(`${index_js_1.config.emojis.check} Bot online sebagai: ${client.user?.tag}`);
    console.log(`${index_js_1.config.emojis.check} ID Bot: ${client.user?.id}`);
    console.log(`${index_js_1.config.emojis.check} Server aktif: ${client.guilds.cache.size}`);
    // Init database
    (0, database_js_1.initDatabase)();
    // Set activity/status
    client.user?.setPresence({
        activities: [
            {
                name: '🛡️ Menjaga Ketertiban | ketik "status bot"',
                type: discord_js_1.ActivityType.Watching,
            },
        ],
        status: 'online',
    });
    // Register guild settings untuk semua server
    const { getGuildSettings } = await Promise.resolve().then(() => __importStar(require('../utils/database.js')));
    for (const [, guild] of client.guilds.cache) {
        getGuildSettings(guild.id);
        console.log(`${index_js_1.config.emojis.check} Terdaftar di server: ${guild.name} (${guild.memberCount} member)`);
    }
    console.log(`\n${index_js_1.config.emojis.shield} Galaxi Auto Moderator siap bertugas!`);
    console.log(`${index_js_1.config.emojis.shield} ═══════════════════════════════════════\n`);
}
//# sourceMappingURL=ready.js.map