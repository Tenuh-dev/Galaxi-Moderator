"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = initDatabase;
exports.addWarn = addWarn;
exports.getWarns = getWarns;
exports.getWarnCount = getWarnCount;
exports.clearWarns = clearWarns;
exports.removeWarn = removeWarn;
exports.addMute = addMute;
exports.getMute = getMute;
exports.removeMute = removeMute;
exports.getExpiredMutes = getExpiredMutes;
exports.addModLog = addModLog;
exports.getGuildSettings = getGuildSettings;
exports.updateGuildSetting = updateGuildSetting;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const DATA_DIR = path_1.default.join(process.cwd(), 'data');
const DB_FILE = path_1.default.join(DATA_DIR, 'galaxi.json');
let db;
function loadDb() {
    if (!(0, fs_1.existsSync)(DATA_DIR))
        (0, fs_1.mkdirSync)(DATA_DIR, { recursive: true });
    if (!(0, fs_1.existsSync)(DB_FILE)) {
        const empty = {
            warns: [],
            mutes: [],
            mod_logs: [],
            guild_settings: {},
            _meta: { lastWarnId: 0, lastLogId: 0 },
        };
        (0, fs_1.writeFileSync)(DB_FILE, JSON.stringify(empty, null, 2));
        return empty;
    }
    return JSON.parse((0, fs_1.readFileSync)(DB_FILE, 'utf8'));
}
function saveDb() {
    (0, fs_1.writeFileSync)(DB_FILE, JSON.stringify(db, null, 2));
}
function initDatabase() {
    db = loadDb();
    console.log('✅ Database berhasil diinisialisasi');
}
function getDb() {
    if (!db)
        db = loadDb();
    return db;
}
// ── Warn functions ─────────────────────────────────────────────────────────
function addWarn(guildId, userId, moderatorId, reason) {
    const d = getDb();
    const id = ++d._meta.lastWarnId;
    d.warns.push({ id, guild_id: guildId, user_id: userId, moderator_id: moderatorId, reason, timestamp: Date.now() });
    saveDb();
    return id;
}
function getWarns(guildId, userId) {
    return getDb().warns
        .filter(w => w.guild_id === guildId && w.user_id === userId)
        .sort((a, b) => b.timestamp - a.timestamp);
}
function getWarnCount(guildId, userId) {
    return getDb().warns.filter(w => w.guild_id === guildId && w.user_id === userId).length;
}
function clearWarns(guildId, userId) {
    const d = getDb();
    const before = d.warns.length;
    d.warns = d.warns.filter(w => !(w.guild_id === guildId && w.user_id === userId));
    saveDb();
    return before - d.warns.length;
}
function removeWarn(warnId) {
    const d = getDb();
    const before = d.warns.length;
    d.warns = d.warns.filter(w => w.id !== warnId);
    saveDb();
    return d.warns.length < before;
}
// ── Mute functions ─────────────────────────────────────────────────────────
function addMute(guildId, userId, moderatorId, reason, expiresAt) {
    const d = getDb();
    d.mutes = d.mutes.filter(m => !(m.guild_id === guildId && m.user_id === userId));
    d.mutes.push({ guild_id: guildId, user_id: userId, expires_at: expiresAt, moderator_id: moderatorId, reason });
    saveDb();
}
function getMute(guildId, userId) {
    return getDb().mutes.find(m => m.guild_id === guildId && m.user_id === userId) || null;
}
function removeMute(guildId, userId) {
    const d = getDb();
    d.mutes = d.mutes.filter(m => !(m.guild_id === guildId && m.user_id === userId));
    saveDb();
}
function getExpiredMutes() {
    return getDb().mutes.filter(m => m.expires_at <= Date.now());
}
// ── Mod log functions ──────────────────────────────────────────────────────
function addModLog(guildId, action, userId, moderatorId, reason, extra) {
    const d = getDb();
    const id = ++d._meta.lastLogId;
    d.mod_logs.push({
        id,
        guild_id: guildId,
        action,
        user_id: userId,
        moderator_id: moderatorId,
        reason,
        timestamp: Date.now(),
        extra: extra ? JSON.stringify(extra) : undefined,
    });
    if (d.mod_logs.length > 1000)
        d.mod_logs = d.mod_logs.slice(-1000);
    saveDb();
}
// ── Guild settings ─────────────────────────────────────────────────────────
function makeDefaultSettings(guildId) {
    return {
        guild_id: guildId,
        max_warns_kick: 3,
        max_warns_ban: 5,
        spam_threshold: 5,
        spam_interval_ms: 5000,
        max_mentions: 5,
        auto_mod_enabled: 1,
    };
}
function getGuildSettings(guildId) {
    const d = getDb();
    if (!d.guild_settings[guildId]) {
        d.guild_settings[guildId] = makeDefaultSettings(guildId);
        saveDb();
    }
    return d.guild_settings[guildId];
}
function updateGuildSetting(guildId, key, value) {
    const d = getDb();
    if (!d.guild_settings[guildId]) {
        d.guild_settings[guildId] = makeDefaultSettings(guildId);
    }
    d.guild_settings[guildId][key] = value;
    saveDb();
}
//# sourceMappingURL=database.js.map