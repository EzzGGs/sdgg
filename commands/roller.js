const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roller')
        .setDescription('Sunucudaki tüm rolleri listeler.'),

    async execute(interaction) {
        // Yalnızca yöneticilerin kullanabilmesi için izin kontrolü
        if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yönetici olmanız gerekiyor.', ephemeral: true });
        }

        const roles = interaction.guild.roles.cache
            .filter(role => role.name !== '@everyone')
            .map(role => `${role.name} (${role.id})`)
            .join('\n');

        if (!roles) {
            return interaction.reply({ content: 'Sunucuda hiçbir rol bulunamadı.', ephemeral: true });
        }

        const embed = new MessageEmbed()
            .setTitle('Sunucudaki Roller')
            .setDescription(roles)
            .setColor('BLUE');

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
