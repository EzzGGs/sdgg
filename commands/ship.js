const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ship')
        .setDescription('İki kullanıcı arasındaki uyumu ölçer.')
        .addUserOption(option => 
            option.setName('kullanıcı')
                .setDescription('Uyumu ölçmek istediğiniz kullanıcıyı seçin')
                .setRequired(true)),

    async execute(interaction) {
        // Yalnızca yöneticilerin kullanabilmesi için izin kontrolü
        if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yönetici olmanız gerekiyor.', ephemeral: true });
        }

        const targetUser = interaction.options.getUser('kullanıcı');

        // Uyum puanı ve kalp oluşturma
        const compatibility = Math.floor(Math.random() * 10) + 1;
        const hearts = '❤️'.repeat(compatibility) + '🤍'.repeat(10 - compatibility);

        // Embed oluşturma
        const embed = new MessageEmbed()
            .setColor('#FF69B4')
            .setTitle('💘 Aşk Testi Sonuçları 💘')
            .setDescription(`${interaction.user} ve ${targetUser} arasındaki uyum:

**${hearts}**

Puan: **${compatibility}/10**`)
            .setFooter({ text: 'Aşk ölçer sadece eğlence amaçlıdır. 😄' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
