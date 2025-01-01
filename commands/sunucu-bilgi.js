const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sunucu-bilgi')
        .setDescription('Sunucunun bilgilerini gösterir.'),
    async execute(interaction) {
        // Yönetici yetkisi kontrolü
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'Bu komutu kullanmak için gerekli yetkiniz yok.', ephemeral: true });
        }

        const guild = interaction.guild;
        const bans = await guild.bans.fetch();

        const embed = new MessageEmbed()
            .setColor('#0099FF')
            .setTitle(`${guild.name} - Sunucu Bilgileri`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '👑 Sunucu Sahibi', value: `<@${guild.ownerId}>`, inline: true },
                { name: '👥 Üye Sayısı', value: `${guild.memberCount} üye`, inline: true },
                { name: '📅 Oluşturulma Tarihi', value: `${guild.createdAt.toLocaleDateString('tr-TR')}`, inline: false },
                { name: '🚀 Boost Seviyesi', value: `${guild.premiumTier || 'Yok'}`, inline: true },
                { name: '💎 Boost Sayısı', value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
                { name: '📜 Rol Sayısı', value: `${guild.roles.cache.size} rol`, inline: true },
                { name: '📂 Kanal Sayısı', value: `${guild.channels.cache.size} kanal`, inline: true },
                { name: '🔨 Yasaklı Kullanıcılar', value: `${bans.size} kişi`, inline: true },
                { name: '🌍 Bölge', value: `${guild.preferredLocale}`, inline: true },
                { name: '🔗 Davet Bağlantıları', value: `${(await guild.invites.fetch()).size} adet`, inline: true }
            )
            .setFooter({ text: `Sunucu ID: ${guild.id}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
