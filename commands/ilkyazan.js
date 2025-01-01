const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');

let firstWriterActive = false;
let winner = null;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ilkyazan')
        .setDescription('İlk yazan etkinliğini başlatır.'),

    async execute(interaction) {
        // Yalnızca yöneticilerin kullanabilmesi için izin kontrolü
        if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yönetici olmanız gerekiyor.', ephemeral: true });
        }

        if (firstWriterActive) {
            return interaction.reply({ content: 'Zaten bir ilk yazan etkinliği devam ediyor.', ephemeral: true });
        }

        firstWriterActive = true;
        winner = null;

        const channel = interaction.channel;
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SEND_MESSAGES: true });

        await channel.send('@here');

        const startEmbed = new MessageEmbed()
            .setTitle('İlk Yazan Etkinliği Başladı!')
            .setDescription('Bu kanalda ilk mesajı yazan kişi ödülü kazanacak!')
            .setColor('GREEN');

        await interaction.reply({ embeds: [startEmbed] });

        const collector = channel.createMessageCollector({ filter: () => true, max: 1, time: 60000 });

        collector.on('collect', async message => {
            winner = message.author;
            const winEmbed = new MessageEmbed()
                .setTitle('Kazanan Belirlendi!')
                .setDescription(`${winner} bu kanalda ilk mesajı yazarak etkinliği kazandı!`)
                .setColor('GOLD');

            await channel.send({ embeds: [winEmbed] });

            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SEND_MESSAGES: false });
            firstWriterActive = false;
        });

        collector.on('end', async collected => {
            if (!collected.size) {
                const timeoutEmbed = new MessageEmbed()
                    .setTitle('Etkinlik Sona Erdi')
                    .setDescription('Kimse mesaj yazmadığı için etkinlik sona erdi.')
                    .setColor('RED');

                await channel.send({ embeds: [timeoutEmbed] });
                await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SEND_MESSAGES: false });
                firstWriterActive = false;
            }
        });
    }
};
