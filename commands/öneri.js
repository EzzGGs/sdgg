const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('öneri')
    .setDescription('Bir kanalı öneri sistemi için ayarlar.')
    .addChannelOption(option =>
      option
        .setName('kanal')
        .setDescription('Öneri mesajlarının yazılacağı kanal.')
        .setRequired(true)
    ),
  async execute(interaction) {
    // Kullanıcının gerekli izne sahip olup olmadığını kontrol et
    if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
      return interaction.reply({
        content:
          'Bu komutu kullanmak için kanal yönetme iznine sahip olmanız gerekmektedir.',
        ephemeral: true,
      });
    }

    const channel = interaction.options.getChannel('kanal');

    if (!channel.isText()) {
      return interaction.reply({
        content: 'Belirttiğiniz kanal bir metin kanalı olmalıdır.',
        ephemeral: true,
      });
    }

    // Kanal ID'sini kaydetmek için basit bir veri yapısı
    const fs = require('fs');
    const dbPath = './suggestion_channels.json';

    let suggestionChannels = {};

    // Mevcut veriyi yükle
    if (fs.existsSync(dbPath)) {
      suggestionChannels = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    }

    // Kanal ID'sini kaydet
    suggestionChannels[interaction.guild.id] = channel.id;

    // Veriyi dosyaya yaz
    fs.writeFileSync(dbPath, JSON.stringify(suggestionChannels, null, 2), 'utf-8');

    return interaction.reply({
      content: `Öneri sistemi başarıyla **${channel.name}** kanalına ayarlandı.`,
      ephemeral: true,
    });
  },
};
