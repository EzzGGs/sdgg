const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Belirli bir kullanıcıyı sunucudan yasaklar.')
    .addUserOption(option => option.setName('kullanıcı').setDescription('Yasaklanacak kullanıcı').setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has('BAN_MEMBERS')) {
      return interaction.reply('Bu komutu kullanmak için üye yasaklama iznine sahip olmanız gerekmektedir.');
    }

    const user = interaction.options.getUser('kullanıcı');
    const member = interaction.guild.members.cache.get(user.id);

    if (member) {
      await member.ban();
      const embed = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle('Kullanıcı Yasaklandı')
        .setDescription(`${user.tag} sunucudan yasaklandı!`)
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    } else {
      return interaction.reply('Kullanıcı bulunamadı.');
    }
  },
};
