const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('çevir')
        .setDescription('Türkçe bir metni İngilizceye çevirir.')
        .addStringOption(option =>
            option.setName('yazi')
                .setDescription('Çevrilecek Türkçe metni girin')
                .setRequired(true)),

    async execute(interaction) {
        const text = interaction.options.getString('yazi');

        try {
            const response = await axios.get('https://api.mymemory.translated.net/get', {
                params: {
                    q: text,
                    langpair: 'tr|en',
                },
            });

            const translatedText = response.data.responseData.translatedText;
            await interaction.reply({ content: `Çevrilen metin: **${translatedText}**`, ephemeral: true });
        } catch (error) {
            console.error('Çeviri hatası:', error);
            await interaction.reply({ content: 'Bir hata oluştu, lütfen tekrar deneyin.', ephemeral: true });
        }
    },
};
