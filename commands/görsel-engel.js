const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('görsel')
        .setDescription('Belirtilen kanalda görsel harici her şeyi siler.')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Sadece görsellerin kalacağı kanal')
                .setRequired(true)
        ),
    async execute(interaction) {
        // Yönetici yetkisi kontrolü
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'Bu komutu kullanmak için gerekli yetkiniz yok.', ephemeral: true });
        }

        const channel = interaction.options.getChannel('kanal');

        // Kanal kontrolü
        if (channel.type !== 'GUILD_TEXT') {
            return interaction.reply({ content: 'Lütfen bir metin kanalı seçin.', ephemeral: true });
        }

        await interaction.reply({ content: `${channel} kanalında görsel dışı içerikler silinecek.`, ephemeral: true });

        // Bot mesaj dinlemeye başlar
        const { client } = interaction;
        client.on('messageCreate', async (message) => {
            // Kanal ID ve görsel kontrolü
            if (message.channel.id === channel.id && !message.attachments.size) {
                try {
                    await message.delete();
                } catch (error) {
                    console.error(`Mesaj silinemedi: ${error}`);
                }
            }
        });
    },
};
