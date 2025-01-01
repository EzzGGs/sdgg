const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const afkUsers = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('AFK durumunuzu ayarlayın')
        .addStringOption(option => 
            option.setName('sebep')
                .setDescription('AFK olma sebebiniz')
                .setRequired(true)),

    async execute(interaction) {
        const reason = interaction.options.getString('sebep');

        const afkEmbed = new MessageEmbed()
            .setTitle('AFK')
            .setDescription(`AFK oldunuz. Sebep: ${reason}`)
            .setColor('BLUE');

        afkUsers.set(interaction.user.id, reason);

        await interaction.reply({ embeds: [afkEmbed], ephemeral: true });
    },
    afkUsers // AFK kullanıcıları dışarı aktar
};
