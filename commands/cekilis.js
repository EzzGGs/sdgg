const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed, Permissions } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cekilis')
        .setDescription('Çekiliş başlatır.')
        .addStringOption(option => 
            option.setName('odul')
                .setDescription('Çekiliş ödülü.')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('sure')
                .setDescription('Çekiliş süresi (dakika cinsinden).')
                .setRequired(true)),

    async execute(interaction) {
        // Yönetici izni kontrolü
        if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için Yönetici iznine sahip olmalısınız.', ephemeral: true });
        }

        const odul = interaction.options.getString('odul');
        const sure = interaction.options.getInteger('sure') * 60; // Dakika -> Saniye
        let kalanSure = sure;

        const participants = new Set(); // Katılımcıları tutar

        const embed = new MessageEmbed()
            .setTitle('🎉 Çekiliş Başladı! 🎉')
            .setDescription(`Ödül: **${odul}**\nÇekilişe katılmak için aşağıdaki "Katıl" butonuna tıklayın!\n\nKalan Süre: **${Math.floor(kalanSure / 60)} dakika ${kalanSure % 60} saniye**`)
            .setColor('BLUE');

        const row = () => new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('join_cekilis')
                .setLabel('Katıl')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId('leave_cekilis')
                .setLabel('Çekilişten Çık')
                .setStyle('DANGER'),
            new MessageButton()
                .setCustomId('participant_count')
                .setLabel(`Katılımcı Sayısı: ${participants.size}`)
                .setStyle('SECONDARY')
                .setDisabled(true) // Gösterim için
        );

        const message = await interaction.reply({ embeds: [embed], components: [row()], fetchReply: true });

        const collector = message.createMessageComponentCollector({ time: sure * 1000 });

        const interval = setInterval(async () => {
            kalanSure -= 1;
            if (kalanSure > 0) {
                embed.setDescription(`Ödül: **${odul}**\nÇekilişe katılmak için aşağıdaki "Katıl" butonuna tıklayın!\n\nKalan Süre: **${Math.floor(kalanSure / 60)} dakika ${kalanSure % 60} saniye**`);
                await message.edit({ embeds: [embed], components: [row()] });
            }
        }, 1000);

        collector.on('collect', async buttonInteraction => {
            if (buttonInteraction.customId === 'join_cekilis') {
                if (!participants.has(buttonInteraction.user.id)) {
                    participants.add(buttonInteraction.user.id);
                    await buttonInteraction.reply({ content: 'Çekilişe katıldınız!', ephemeral: true });
                } else {
                    await buttonInteraction.reply({ content: 'Zaten çekilişe katıldınız.', ephemeral: true });
                }
            } else if (buttonInteraction.customId === 'leave_cekilis') {
                if (participants.has(buttonInteraction.user.id)) {
                    participants.delete(buttonInteraction.user.id);
                    await buttonInteraction.reply({ content: 'Çekilişten çıktınız.', ephemeral: true });
                } else {
                    await buttonInteraction.reply({ content: 'Çekilişe zaten katılmamışsınız.', ephemeral: true });
                }
            }

            // Katılımcı sayısını güncelle
            await message.edit({ components: [row()] });
        });

        collector.on('end', async () => {
            clearInterval(interval);

            if (participants.size === 0) {
                return interaction.followUp({ content: 'Çekilişe kimse katılmadı, kazanan yok.', embeds: [], components: [] });
            }

            const winnerId = Array.from(participants)[Math.floor(Math.random() * participants.size)];
            const winner = `<@${winnerId}>`;

            const resultEmbed = new MessageEmbed()
                .setTitle('🎉 Çekiliş Sona Erdi! 🎉')
                .setDescription(`Ödül: **${odul}**\nKazanan: ${winner}`)
                .setColor('GREEN');

            await interaction.followUp({ embeds: [resultEmbed], components: [] });
        });
    },
};
