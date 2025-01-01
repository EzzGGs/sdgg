const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Belirli bir kullanıcıyı sunucudan atar.')
    .addUserOption(option =>
      option
        .setName('kullanıcı')
        .setDescription('Atılacak kullanıcı')
        .setRequired(true)
    ),
  async execute(interaction) {
    // Kullanıcının gerekli izne sahip olup olmadığını kontrol et
    if (!interaction.member.permissions.has('KICK_MEMBERS')) {
      return interaction.reply({
        content:
          'Bu komutu kullanmak için üye atma iznine sahip olmanız gerekmektedir.',
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser('kullanıcı');
    const member = interaction.guild.members.cache.get(user.id);

    // Sunucuda üye bulunamazsa
    if (!member) {
      return interaction.reply({
        content: 'Bu kullanıcı sunucuda bulunmuyor.',
        ephemeral: true,
      });
    }

    // Botun bu kullanıcıyı atabilecek izne sahip olup olmadığını kontrol et
    if (!member.kickable) {
      return interaction.reply({
        content: 'Bu kullanıcıyı atamıyorum. Bunun sebebi, benden daha yüksek bir role sahip olması veya botun gerekli izinlere sahip olmamasıdır.',
        ephemeral: true,
      });
    }

    // Kullanıcıyı at ve embed gönder
    try {
      await member.kick(); // Kullanıcıyı sunucudan at
      const embed = new MessageEmbed()
        .setColor('#ff9900')
        .setTitle('Kullanıcı Atıldı')
        .setDescription(`${user.tag} başarıyla sunucudan atıldı!`)
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Kick Hatası:', error);
      return interaction.reply({
        content: 'Kullanıcıyı atarken bir hata oluştu. Lütfen botun yetkilerini kontrol edin.',
        ephemeral: true,
      });
    }
  },
};
