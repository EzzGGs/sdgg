const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invites')
        .setDescription('Bir kullanıcının davet istatistiklerini gösterir.')
        .addUserOption(option => 
            option.setName('kullanıcı')
                .setDescription('Davet istatistiklerini görmek istediğiniz kullanıcıyı seçin')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('kullanıcı') || interaction.user;
        const guild = interaction.guild;

        try {
            const invites = await guild.invites.fetch();
            const userInvites = invites.filter(invite => invite.inviter && invite.inviter.id === user.id);
            let inviteCount = 0;
            let totalUses = 0;

            userInvites.forEach(invite => {
                inviteCount += 1;
                totalUses += invite.uses;
            });

            const inviteEmbed = new MessageEmbed()
                .setAuthor(user.username, user.displayAvatarURL())
                .setColor('RANDOM')
                .setTitle(`${user.username} Davet İstatistikleri`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .addField('Toplam Davet:', `${inviteCount}`, true)
                .addField('Toplam Kullanım:', `${totalUses}`, true)
                .setFooter(`${interaction.user.tag} tarafından istendi.`, interaction.user.displayAvatarURL())
                .setTimestamp();

            await interaction.reply({ embeds: [inviteEmbed] });
        } catch (error) {
            console.error('Davet istatistikleri alınırken hata oluştu:', error);
            await interaction.reply('Davet istatistikleri alınırken bir hata oluştu.');
        }
    },
};
