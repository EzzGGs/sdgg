const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Bir embed oluşturur.')
        .addStringOption(option => 
            option.setName('baslik')
                .setDescription('Embed başlığı')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('yazi')
                .setDescription('Embed yazısı')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('alt_yazi')
                .setDescription('Embed en alt yazısı')
                .setRequired(true))
        .addChannelOption(option => 
            option.setName('kanal')
                .setDescription('Mesajın gönderileceği kanal')
                .setRequired(true)),

    async execute(interaction) {
        // Yönetici izni kontrolü
        if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için Yönetici iznine sahip olmalısınız.', ephemeral: true });
        }

        const baslik = interaction.options.getString('baslik');
        const yazi = interaction.options.getString('yazi');
        const altYazi = interaction.options.getString('alt_yazi');
        const kanal = interaction.options.getChannel('kanal');

        const embed = new MessageEmbed()
            .setTitle(baslik)
            .setDescription(yazi)
            .setFooter(altYazi)
            .setColor('GREEN');

        await kanal.send({ embeds: [embed] });
        await interaction.reply({ content: 'Embed başarıyla gönderildi!', ephemeral: true });
    }
};
