const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban-affı')
        .setDescription('Sunucudan banlanan herkesin banını kaldırır.'),
    async execute(interaction) {
        // Yönetici yetkisi kontrolü
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'Bu komutu kullanmak için gerekli yetkiniz yok.', ephemeral: true });
        }

        const guild = interaction.guild;
        const bans = await guild.bans.fetch();

        if (bans.size === 0) {
            return interaction.reply({ content: 'Sunucuda banlanmış hiç kullanıcı yok.', ephemeral: true });
        }

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('confirm-unban')
                    .setLabel('Onaylıyorum')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('cancel-unban')
                    .setLabel('İptal')
                    .setStyle('DANGER')
            );

        const embed = new MessageEmbed()
            .setColor('#FF9900')
            .setTitle('Ban Affı Onayı')
            .setDescription(`Bu işlem, sunucudan banlanan **${bans.size}** kişinin banını kaldıracak. Onaylıyor musunuz?`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], components: [row] });

        const filter = (i) => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'confirm-unban') {
                for (const ban of bans.values()) {
                    await guild.bans.remove(ban.user.id, 'Toplu ban affı');
                }

                await i.update({ content: 'Tüm kullanıcıların banı başarıyla kaldırıldı.', components: [], embeds: [] });
            } else if (i.customId === 'cancel-unban') {
                await i.update({ content: 'İşlem iptal edildi.', components: [], embeds: [] });
            }

            collector.stop();
        });

        collector.on('end', (_, reason) => {
            if (reason !== 'messageDelete') {
                interaction.editReply({ components: [] }).catch(console.error);
            }
        });
    }
};
