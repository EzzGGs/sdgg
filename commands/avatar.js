const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Bir kullanıcının avatarını gösterir.')
        .addUserOption(option => 
            option.setName('kullanıcı')
                .setDescription('Avatarını görmek istediğiniz kullanıcıyı seçin')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('kullanıcı') || interaction.user;

        const avatarEmbed = new MessageEmbed()
            .setAuthor(user.username, user.displayAvatarURL())
            .setColor('RANDOM')
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setFooter(`${interaction.user.tag} tarafından istendi.`, interaction.user.displayAvatarURL())
            .setDescription(`[Avatarı indir](${user.displayAvatarURL({ dynamic: true, size: 1024 })})`);

        await interaction.reply({ embeds: [avatarEmbed] });
    },
};
