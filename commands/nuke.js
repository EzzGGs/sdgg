const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('Mevcut kanalı siler ve aynı isim ve ayarlarla yeniden oluşturur.'),
  async execute(interaction) {
    if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
      return interaction.reply('Bu komutu kullanmak için kanalları yönetme iznine sahip olmanız gerekmektedir.');
    }

    const channel = interaction.channel;
    const channelPosition = channel.position;

    const embed = new MessageEmbed()
      .setColor('#ff0000')
      .setTitle('Kanal Nuked')
      .setDescription(`Kanal **${channel.name}** silindi ve yeniden oluşturuldu.\nNuked by: ${interaction.user.tag}`)
      .setTimestamp();

    await channel.clone()
      .then(clonedChannel => {
        clonedChannel.setPosition(channelPosition);
        clonedChannel.send({ embeds: [embed] });
        channel.delete();
      })
      .catch(err => {
        console.error(err);
        interaction.reply('Bir hata oluştu ve kanal silinemedi veya yeniden oluşturulamadı.');
      });

    return interaction.reply({ content: 'Kanal başarıyla nuked edildi!', ephemeral: true });
  },
};
