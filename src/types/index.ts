import { Client, Collection } from 'discord.js';
import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';

export interface BotCommand {
  data: {
    name: string;
    toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody;
  };
  execute: (interaction: import('discord.js').ChatInputCommandInteraction) => Promise<void>;
}

export interface ExtendedClient extends Client {
  commands: Collection<string, BotCommand>;
}

export interface WarnRecord {
  id: number;
  guild_id: string;
  user_id: string;
  moderator_id: string;
  reason: string;
  timestamp: number;
}

export interface MuteRecord {
  guild_id: string;
  user_id: string;
  expires_at: number;
  moderator_id: string;
  reason: string;
}

export interface GuildSettings {
  guild_id: string;
  log_channel_id?: string;
  mod_role_id?: string;
  max_warns_kick: number;
  max_warns_ban: number;
  spam_threshold: number;
  spam_interval_ms: number;
  max_mentions: number;
  auto_mod_enabled: number;
  [key: string]: string | number | undefined;
}

export interface SpamTracker {
  messages: number[];
  warned: boolean;
}

export interface ToxicPattern {
  pattern: RegExp;
  category: string;
  severity: 'low' | 'medium' | 'high';
}
