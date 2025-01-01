const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kişi')
        .setDescription('Sunucuda kaç aktif, kaç çevrimdışı ve toplam kaç kişi olduğunu gösterir.'),

    async execute(interaction) {
        const guild = interaction.guild;
        const members = await guild.members.fetch();

        const totalMembers = members.size;
        const onlineMembers = members.filter(member => member.presence && member.presence.status !== 'offline').size;
        const offlineMembers = totalMembers - onlineMembers;

        const embed = new MessageEmbed()
            .setTitle('Sunucu Üye Bilgileri')
            .addField('Toplam Üye', totalMembers.toString(), true)
            .addField('Çevrimiçi Üye', onlineMembers.toString(), true)
            .addField('Çevrimdışı Üye', offlineMembers.toString(), true)
            .setColor('BLUE')
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
