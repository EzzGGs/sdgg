const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

// CapsEngel kontrolü için bir değişken
let capsEngelAktif = false;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('capsengel')
        .setDescription('CapsLock engelini açar veya kapatır.')
        .addStringOption(option => 
            option.setName('durum')
                .setDescription('"aç" veya "kapat" olarak ayarlayın')
                .setRequired(true)),

    async execute(interaction) {
        // Yalnızca yöneticilerin kullanabilmesi için izin kontrolü
        if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yönetici olmanız gerekiyor.', ephemeral: true });
        }

        const durum = interaction.options.getString('durum');

        if (durum === 'aç') {
            capsEngelAktif = true;
            await interaction.reply({ content: 'CapsLock engeli başarıyla **açıldı**.', ephemeral: true });
        } else if (durum === 'kapat') {
            capsEngelAktif = false;
            await interaction.reply({ content: 'CapsLock engeli başarıyla **kapatıldı**.', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Geçersiz seçenek. "aç" veya "kapat" yazmalısınız.', ephemeral: true });
        }
    },
};

// Mesaj dinleme olayı
module.exports.onMessageCreate = async (message) => {
    if (!capsEngelAktif || message.author.bot) return;

    const capsRatio = (message.content.replace(/[^A-Z]/g, '').length / message.content.length) * 100;

    if (capsRatio >= 70) {
        await message.delete();
        await message.channel.send({ content: `${message.author}, lütfen mesajlarınızda fazla büyük harf kullanmaktan kaçının.` });
    }
};
