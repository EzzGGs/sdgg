const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment } = require('discord.js');
const QRCode = require('qrcode');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('qr')
        .setDescription('Girilen yazıyı QR koda dönüştürür.')
        .addStringOption(option => 
            option.setName('yazı')
                .setDescription('QR koda dönüştürülecek yazı')
                .setRequired(true)),

    async execute(interaction) {
        // Yalnızca yöneticilerin bu komutu kullanabilmesi için yetki kontrolü
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yetkiniz yok.', ephemeral: true });
        }

        const yazı = interaction.options.getString('yazı');

        try {
            const qrCodeImage = await QRCode.toBuffer(yazı, { type: 'png' });
            const attachment = new MessageAttachment(qrCodeImage, 'qrcode.png');

            await interaction.reply({
                content: 'İşte QR kodunuz:',
                files: [attachment]
            });
        } catch (error) {
            console.error('QR kod oluşturulurken bir hata oluştu:', error);
            await interaction.reply('QR kod oluşturulurken bir hata oluştu.');
        }
    },
};
