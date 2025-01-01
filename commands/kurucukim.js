const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kurucukim')
        .setDescription('Sunucunun kurucusunun kim olduğunu gösterir.'),

    async execute(interaction) {
        const guildOwner = await interaction.guild.fetchOwner();

        const embed = new MessageEmbed()
            .setTitle('Sunucunun Kurucusu')
            .setDescription(`Sunucunun kurucusu: ${guildOwner.user.tag}`)
            .setColor('BLUE')
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
