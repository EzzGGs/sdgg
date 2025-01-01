const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bakım')
        .setDescription('Bakım modunu açar veya kapatır.')
        .addStringOption(option => 
            option.setName('durum')
                .setDescription('Bakım durumu')
                .setRequired(true)
                .addChoices(
                    { name: 'Açık', value: 'true' },
                    { name: 'Kapalı', value: 'false' }
                )),

    async execute(interaction) {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'Bu komutu kullanma yetkiniz yok.', ephemeral: true });
        }

        const durum = interaction.options.getString('durum') === 'true';

        config.maintenanceMode = durum;

        fs.writeFile('./config.json', JSON.stringify(config, null, 2), (err) => {
            if (err) {
                console.error('Konfigürasyon dosyası kaydedilirken hata oluştu:', err);
                return interaction.reply('Konfigürasyon dosyası kaydedilirken bir hata oluştu.');
            }

            interaction.reply(`Bakım modu ${durum ? 'açıldı' : 'kapandı'}.`);
        });
    },
};
