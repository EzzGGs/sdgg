const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Belirli bir kullanıcının yasağını kaldırır.')
    .addStringOption(option => option.setName('kullanıcı').setDescription('Yasağı kaldırılacak kullanıcının ID\'si').setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has('BAN_MEMBERS')) {
      return interaction.reply('Bu komutu kullanmak için üye yasaklama iznine sahip olmanız gerekmektedir.');
    }

    const userId = interaction.options.getString('kullanıcı');

    try {
      await interaction.guild.members.unban(userId);
      const embed = new MessageEmbed()
        .setColor('#00ff00')
        .setTitle('Kullanıcı Yasağı Kaldırıldı')
        .setDescription(`Kullanıcının yasağı başarıyla kaldırıldı! \nUnbanned by: ${interaction.user.tag}`)
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction.reply('Kullanıcının yasağı kaldırılırken bir hata oluştu veya kullanıcı yasaklı değil.');
    }
  },
};
