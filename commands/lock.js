const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Kanalı kilitler ve @everyone için mesaj gönderme iznini kapatır.'),
    async execute(interaction) {
        if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
            return interaction.reply('Bu komutu kullanmak için kanal yönetme iznine sahip olmanız gerekmektedir.');
        }

        const channel = interaction.channel;
        const everyoneRole = interaction.guild.roles.everyone;

        await channel.permissionOverwrites.edit(everyoneRole, { SEND_MESSAGES: false });

        const embed = new MessageEmbed()
            .setTitle('Kanal Kilitlendi')
            .setColor(0xff0000)
            .setDescription(`Kanal **${channel.name}** kilitlendi. @everyone rolü için mesaj gönderme izni kapatıldı.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
