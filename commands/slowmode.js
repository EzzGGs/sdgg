const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Kanal için yavaş modu ayarlar.')
        .addIntegerOption(option => 
            option.setName('saniye')
                .setDescription('Yavaş modu ayarlamak istediğiniz süre (saniye)')
                .setRequired(true)),

    async execute(interaction) {
        // Yalnızca yöneticilerin bu komutu kullanabilmesi için yetki kontrolü
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yetkiniz yok.', ephemeral: true });
        }

        const seconds = interaction.options.getInteger('saniye');

        if (seconds < 0 || seconds > 21600) {
            return interaction.reply({ content: 'Yavaş modu süresi 0 ile 21600 saniye arasında olmalıdır.', ephemeral: true });
        }

        try {
            await interaction.channel.setRateLimitPerUser(seconds);
            return interaction.reply({ content: `Bu kanal için yavaş modu ${seconds} saniye olarak ayarlandı.`, ephemeral: true });
        } catch (error) {
            console.error('Yavaş modu ayarlanırken bir hata oluştu:', error);
            return interaction.reply({ content: 'Yavaş modu ayarlanırken bir hata oluştu.', ephemeral: true });
        }
    },
};
