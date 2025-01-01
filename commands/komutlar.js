const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('komutlar')
        .setDescription('Botun commands klasöründe kaç komut olduğunu gösterir (sadece yöneticiler kullanabilir).'),

    async execute(interaction) {
        // Yalnızca yöneticilerin kullanabilmesi için izin kontrolü
        if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yönetici olmanız gerekiyor.', ephemeral: true });
        }

        // commands klasöründeki dosya sayısını kontrol etme
        const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
        const commandCount = commandFiles.length;

        await interaction.reply({ content: `Botta toplamda ${commandCount} komut bulunuyor.`, ephemeral: true });
    },
};
