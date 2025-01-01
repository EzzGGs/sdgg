const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sohbet-gizle')
        .setDescription('Sohbet kanalını gizler veya açar.')
        .addStringOption(option =>
            option.setName('durum')
                .setDescription('"gizle" veya "kapat" olarak ayarlayın')
                .setRequired(true)),

    async execute(interaction) {
        // Yalnızca yöneticilerin kullanabilmesi için izin kontrolü
        if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yönetici olmanız gerekiyor.', ephemeral: true });
        }

        const durum = interaction.options.getString('durum');
        const everyoneRole = interaction.guild.roles.everyone;
        const channel = interaction.channel;

        if (durum === 'gizle') {
            await channel.permissionOverwrites.edit(everyoneRole, { VIEW_CHANNEL: false });
            await interaction.reply({ content: 'Bu kanal everyone rolü için gizlendi.', ephemeral: true });
        } else if (durum === 'kapat') {
            await channel.permissionOverwrites.edit(everyoneRole, { VIEW_CHANNEL: true });
            await interaction.reply({ content: 'Bu kanal everyone rolü için görünür hale getirildi.', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Geçersiz seçenek. "gizle" veya "kapat" yazmalısınız.', ephemeral: true });
        }
    },
};
