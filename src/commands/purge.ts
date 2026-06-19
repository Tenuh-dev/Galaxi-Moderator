import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  TextChannel,
  PermissionFlagsBits,
} from 'discord.js';
import { config } from '../config/index.js';

export const data = new SlashCommandBuilder()
  .setName('purge')
  .setDescription('Hapus beberapa pesan sekaligus')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addIntegerOption(opt =>
    opt.setName('amount').setDescription('Jumlah pesan yang akan dihapus (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)
  )
  .addUserOption(opt =>
    opt.setName('user').setDescription('Hapus pesan dari user tertentu saja').setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const amount = interaction.options.getInteger('amount', true);
  const targetUser = interaction.options.getUser('user');
  const channel = interaction.channel as TextChannel;

  await interaction.deferReply({ ephemeral: true });

  try {
    let messages = await channel.messages.fetch({ limit: 100 });

    if (targetUser) {
      messages = messages.filter(m => m.author.id === targetUser.id);
    }

    // Hanya bisa hapus pesan < 14 hari
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    messages = messages.filter(m => m.createdTimestamp > twoWeeksAgo);

    const toDelete = messages.first(amount);
    const deleted = await channel.bulkDelete(toDelete, true);

    await interaction.editReply({
      content: `${config.emojis.check} Berhasil menghapus **${deleted.size}** pesan${targetUser ? ` dari ${targetUser.tag}` : ''}.`,
    });
  } catch (error) {
    await interaction.editReply({ content: '❌ Gagal menghapus pesan. Pastikan pesan tidak lebih dari 14 hari.' });
  }
}
