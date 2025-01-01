const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sil')
        .setDescription('Belirtilen sayıda mesajı siler.')
        .addIntegerOption(option => 
            option.setName('sayı')
                .setDescription('Silinecek mesaj sayısını belirtin.')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply('Bu komutu kullanma yetkiniz yok.');
        }

        const count = interaction.options.getInteger('sayı');

        if (!count || count < 1 || count > 100) {
            return interaction.reply('Lütfen 1 ile 100 arasında bir sayı girin.');
        }

        try {
            const deleted = await interaction.channel.bulkDelete(count, true); // true: 14 günden eski mesajları yok sayar
            const embed = new MessageEmbed()
                .setTitle('Mesajlar Silindi')
                .setColor(0x00ff00)
                .setDescription(`${deleted.size} mesaj başarıyla silindi.`);

            await interaction.reply({ embeds: [embed] });

            setTimeout(() => interaction.deleteReply(), 5000); // Bilgilendirme mesajını 5 saniye sonra siler
        } catch (error) {
            console.error('Mesajlar silinirken bir hata oluştu:', error);
            interaction.reply('Mesajlar silinirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    },
};
