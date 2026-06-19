import { Message, Events } from 'discord.js';
import { runAutoMod } from '../handlers/autoMod.js';
import { handleBotStatusCommand } from '../handlers/botStatus.js';

export const name = Events.MessageCreate;
export const once = false;

export async function execute(message: Message): Promise<void> {
  if (message.author.bot) return;
  if (!message.guild) return;

  const content = message.content.toLowerCase().trim();

  // Fitur: keyword "bot" atau "status bot"
  if (content === 'bot' || content === 'status bot' || content === '!bot' || content === '!status bot') {
    await handleBotStatusCommand(message);
    return;
  }

  // Jalankan auto moderasi
  await runAutoMod(message);
}
