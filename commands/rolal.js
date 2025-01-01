const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolal')
    .setDescription('Belirli bir kullanıcıdan rol alır')
    .addUserOption(option => option.setName('kullanıcı').setDescription('Rol alınacak kullanıcı').setRequired(true))
    .addRoleOption(option => option.setName('rol').setDescription('Alınacak rol').setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply('Bu komutu kullanmak için yönetici olmanız gerekmektedir.');
    }

    const user = interaction.options.getUser('kullanıcı');
    const role = interaction.options.getRole('rol');

    if (user && role) {
      const member = interaction.guild.members.cache.get(user.id);
      if (member) {
        await member.roles.remove(role);

        const embed = new MessageEmbed()
          .setColor('#ff0000')
          .setTitle('Rol Alındı')
          .setDescription(`${user.tag} kullanıcısından ${role.name} rolü başarıyla alındı!`)
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      } else {
        return interaction.reply('Kullanıcı bulunamadı.');
      }
    } else {
      return interaction.reply('Kullanıcı veya rol geçersiz.');
    }
  },
};
