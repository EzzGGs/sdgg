const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Kanalı açar ve @everyone için mesaj gönderme iznini geri verir.'),
    async execute(interaction) {
        if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
            return interaction.reply('Bu komutu kullanmak için kanal yönetme iznine sahip olmanız gerekmektedir.');
        }

        const channel = interaction.channel;
        const everyoneRole = interaction.guild.roles.everyone;

        await channel.permissionOverwrites.edit(everyoneRole, { SEND_MESSAGES: true });

        const embed = new MessageEmbed()
            .setTitle('Kanal Açıldı')
            .setColor(0x00ff00)
            .setDescription(`Kanal **${channel.name}** açıldı. @everyone rolü için mesaj gönderme izni geri verildi.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
