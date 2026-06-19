import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { WarnRecord, MuteRecord, GuildSettings } from '../types/index.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'galaxi.json');

interface DbSchema {
  warns: WarnRecord[];
  mutes: MuteRecord[];
  mod_logs: Array<{
    id: number;
    guild_id: string;
    action: string;
    user_id: string;
    moderator_id: string;
    reason: string;
    timestamp: number;
    extra?: string;
  }>;
  guild_settings: Record<string, GuildSettings>;
  _meta: { lastWarnId: number; lastLogId: number };
}

let db: DbSchema;

function loadDb(): DbSchema {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DB_FILE)) {
    const empty: DbSchema = {
      warns: [],
      mutes: [],
      mod_logs: [],
      guild_settings: {},
      _meta: { lastWarnId: 0, lastLogId: 0 },
    };
    writeFileSync(DB_FILE, JSON.stringify(empty, null, 2));
    return empty;
  }
  return JSON.parse(readFileSync(DB_FILE, 'utf8')) as DbSchema;
}

function saveDb(): void {
  writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export function initDatabase(): void {
  db = loadDb();
  console.log('✅ Database berhasil diinisialisasi');
}

function getDb(): DbSchema {
  if (!db) db = loadDb();
  return db;
}

// ── Warn functions ─────────────────────────────────────────────────────────

export function addWarn(guildId: string, userId: string, moderatorId: string, reason: string): number {
  const d = getDb();
  const id = ++d._meta.lastWarnId;
  d.warns.push({ id, guild_id: guildId, user_id: userId, moderator_id: moderatorId, reason, timestamp: Date.now() });
  saveDb();
  return id;
}

export function getWarns(guildId: string, userId: string): WarnRecord[] {
  return getDb().warns
    .filter(w => w.guild_id === guildId && w.user_id === userId)
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function getWarnCount(guildId: string, userId: string): number {
  return getDb().warns.filter(w => w.guild_id === guildId && w.user_id === userId).length;
}

export function clearWarns(guildId: string, userId: string): number {
  const d = getDb();
  const before = d.warns.length;
  d.warns = d.warns.filter(w => !(w.guild_id === guildId && w.user_id === userId));
  saveDb();
  return before - d.warns.length;
}

export function removeWarn(warnId: number): boolean {
  const d = getDb();
  const before = d.warns.length;
  d.warns = d.warns.filter(w => w.id !== warnId);
  saveDb();
  return d.warns.length < before;
}

// ── Mute functions ─────────────────────────────────────────────────────────

export function addMute(guildId: string, userId: string, moderatorId: string, reason: string, expiresAt: number): void {
  const d = getDb();
  d.mutes = d.mutes.filter(m => !(m.guild_id === guildId && m.user_id === userId));
  d.mutes.push({ guild_id: guildId, user_id: userId, expires_at: expiresAt, moderator_id: moderatorId, reason });
  saveDb();
}

export function getMute(guildId: string, userId: string): MuteRecord | null {
  return getDb().mutes.find(m => m.guild_id === guildId && m.user_id === userId) || null;
}

export function removeMute(guildId: string, userId: string): void {
  const d = getDb();
  d.mutes = d.mutes.filter(m => !(m.guild_id === guildId && m.user_id === userId));
  saveDb();
}

export function getExpiredMutes(): MuteRecord[] {
  return getDb().mutes.filter(m => m.expires_at <= Date.now());
}

// ── Mod log functions ──────────────────────────────────────────────────────

export function addModLog(
  guildId: string,
  action: string,
  userId: string,
  moderatorId: string,
  reason: string,
  extra?: Record<string, unknown>
): void {
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
  if (d.mod_logs.length > 1000) d.mod_logs = d.mod_logs.slice(-1000);
  saveDb();
}

// ── Guild settings ─────────────────────────────────────────────────────────

function makeDefaultSettings(guildId: string): GuildSettings {
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

export function getGuildSettings(guildId: string): GuildSettings {
  const d = getDb();
  if (!d.guild_settings[guildId]) {
    d.guild_settings[guildId] = makeDefaultSettings(guildId);
    saveDb();
  }
  return d.guild_settings[guildId];
}

export function updateGuildSetting(guildId: string, key: string, value: string | number): void {
  const d = getDb();
  if (!d.guild_settings[guildId]) {
    d.guild_settings[guildId] = makeDefaultSettings(guildId);
  }
  d.guild_settings[guildId][key] = value;
  saveDb();
}
