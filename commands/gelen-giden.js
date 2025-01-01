const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gelen-giden')
        .setDescription('Sunucuya giriş ve çıkış mesajlarını belirtilen kanala gönderir.')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Giriş ve çıkış mesajlarının gönderileceği kanal')
                .setRequired(true)
        ),
    async execute(interaction) {
        // Yönetici yetkisi kontrolü
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'Bu komutu kullanmak için gerekli yetkiniz yok.', ephemeral: true });
        }

        const channel = interaction.options.getChannel('kanal');

        if (channel.type !== 'GUILD_TEXT') {
            return interaction.reply({ content: 'Lütfen bir metin kanalı seçin.', ephemeral: true });
        }

        const { client } = interaction;

        await interaction.reply({ content: `${channel} kanalında giriş ve çıkış mesajları etkinleştirildi.`, ephemeral: true });

        client.on('guildMemberAdd', member => {
            const embed = new MessageEmbed()
                .setColor('#00FF00')
                .setTitle('Hoş Geldin!')
                .setDescription(`🎉 ${member} sunucuya katıldı! Aramıza hoş geldin!`)
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();

            channel.send({ embeds: [embed] });
        });

        client.on('guildMemberRemove', member => {
            const embed = new MessageEmbed()
                .setColor('#FF0000')
                .setTitle('Güle Güle!')
                .setDescription(`😢 ${member.user.tag} sunucudan ayrıldı. Görüşmek üzere!`)
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();

            channel.send({ embeds: [embed] });
        });
    },
};
