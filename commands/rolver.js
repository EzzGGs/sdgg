const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolver')
    .setDescription('Belirli bir kullanıcıya rol verir')
    .addUserOption(option => option.setName('kullanıcı').setDescription('Rol verilecek kullanıcı').setRequired(true))
    .addRoleOption(option => option.setName('rol').setDescription('Verilecek rol').setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply('Bu komutu kullanmak için yönetici olmanız gerekmektedir.');
    }

    const user = interaction.options.getUser('kullanıcı');
    const role = interaction.options.getRole('rol');

    if (user && role) {
      const member = interaction.guild.members.cache.get(user.id);
      if (member) {
        await member.roles.add(role);

        const embed = new MessageEmbed()
          .setColor('#0099ff')
          .setTitle('Rol Verildi')
          .setDescription(`${user.tag} kullanıcısına ${role.name} rolü başarıyla verildi!`)
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
