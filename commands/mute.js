const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Belirli bir kullanıcıyı susturur.')
    .addUserOption(option => option.setName('kullanıcı').setDescription('Susturulacak kullanıcı').setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has('MUTE_MEMBERS')) {
      return interaction.reply('Bu komutu kullanmak için üye susturma iznine sahip olmanız gerekmektedir.');
    }

    const user = interaction.options.getUser('kullanıcı');
    const member = interaction.guild.members.cache.get(user.id);

    if (member) {
      const muteRole = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === 'muted');

      if (muteRole) {
        await member.roles.add(muteRole);
        const embed = new MessageEmbed()
          .setColor('#ffcc00')
          .setTitle('Kullanıcı Susturuldu')
          .setDescription(`${user.tag} susturuldu!`)
          .setTimestamp();
        return interaction.reply({ embeds: [embed] });
      } else {
        return interaction.reply('Muted rolü bulunamadı.');
      }
    } else {
      return interaction.reply('Kullanıcı bulunamadı.');
    }
  },
};
