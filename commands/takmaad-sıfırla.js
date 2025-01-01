const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('takmaad-sıfırla')
        .setDescription('Sunucudaki herkesin takma adlarını sıfırlar.'),
    async execute(interaction) {
        // Yönetici yetkisi kontrolü
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'Bu komutu kullanmak için gerekli yetkiniz yok.', ephemeral: true });
        }

        const guild = interaction.guild;
        const members = await guild.members.fetch();

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('confirm-reset-nicknames')
                    .setLabel('Onaylıyorum')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('cancel-reset-nicknames')
                    .setLabel('İptal')
                    .setStyle('DANGER')
            );

        const embed = new MessageEmbed()
            .setColor('#FF9900')
            .setTitle('Takma Ad Sıfırlama Onayı')
            .setDescription(`Bu işlem, sunucudaki tüm kullanıcıların takma adlarını sıfırlayacak. Onaylıyor musunuz?`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], components: [row] });

        const filter = (i) => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'confirm-reset-nicknames') {
                for (const member of members.values()) {
                    if (member.manageable && member.nickname) {
                        await member.setNickname(null, 'Toplu takma ad sıfırlama');
                    }
                }

                await i.update({ content: 'Tüm kullanıcıların takma adları başarıyla sıfırlandı.', components: [], embeds: [] });
            } else if (i.customId === 'cancel-reset-nicknames') {
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
