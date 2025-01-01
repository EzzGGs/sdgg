const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed, Permissions } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Destek talebi sistemi başlatır.')
        .addRoleOption(option => 
            option.setName('yetkili_rolu')
                .setDescription('Destek taleplerini yönetecek yetkili rolü')
                .setRequired(true))
        .addChannelOption(option => 
            option.setName('kategori_kanali')
                .setDescription('Destek talepleri için kullanılacak kategori kanalı')
                .setRequired(true))
        .addChannelOption(option => 
            option.setName('ticket_mesaj_kanali')
                .setDescription('Destek talebi oluşturma mesajının gönderileceği kanal')
                .setRequired(true)),

    async execute(interaction) {
        // Yönetici izni kontrolü
        if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için Yönetici iznine sahip olmalısınız.', ephemeral: true });
        }

        // Yetkili rolünü, kategori kanalını ve mesaj kanalını al
        const yetkiliRolu = interaction.options.getRole('yetkili_rolu');
        const kategoriKanali = interaction.options.getChannel('kategori_kanali');
        const mesajKanali = interaction.options.getChannel('ticket_mesaj_kanali');

        // Embed oluştur
        const embed = new MessageEmbed()
            .setTitle('Destek Talebi Sistemi')
            .setDescription('Bir destek talebi oluşturmak için aşağıdaki düğmeye tıklayın.')
            .setColor('BLUE');

        // Düğme oluştur
        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('create_ticket')
                .setLabel('Talep Oluştur')
                .setStyle('PRIMARY')
        );

        // Mesajı belirtilen kanala gönder
        await mesajKanali.send({ embeds: [embed], components: [row] });

        const activeTickets = new Map(); // Aktif talepleri saklamak için bir harita

        const filter = i => i.customId === 'create_ticket';
        const collector = mesajKanali.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async buttonInteraction => {
            const userId = buttonInteraction.user.id;

            // Kullanıcının aktif bir talebi var mı kontrol et
            if (activeTickets.has(userId)) {
                const activeChannel = activeTickets.get(userId);
                return buttonInteraction.reply({ 
                    content: `Zaten aktif bir destek talebiniz bulunuyor: ${activeChannel}`, 
                    ephemeral: true 
                });
            }

            const guild = interaction.guild;
            const category = kategoriKanali;

            if (!category || category.type !== 'GUILD_CATEGORY') {
                return buttonInteraction.reply({ content: 'Geçerli bir kategori kanalı seçilmedi.', ephemeral: true });
            }

            const channel = await guild.channels.create(`destek-${buttonInteraction.user.username}`, {
                type: 'GUILD_TEXT',
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [Permissions.FLAGS.VIEW_CHANNEL],
                    },
                    {
                        id: buttonInteraction.user.id,
                        allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES],
                    },
                    {
                        id: yetkiliRolu.id,
                        allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES],
                    },
                ],
            });

            activeTickets.set(userId, `#${channel.name}`); // Aktif talebi kaydet

            const ticketEmbed = new MessageEmbed()
                .setTitle('Destek Talebi')
                .setDescription(`Destek talebiniz oluşturuldu. Yetkililer sizinle en kısa sürede iletişime geçecektir. ${yetkiliRolu}`)
                .setColor('GREEN');

            const closeRow = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId('close_ticket')
                    .setLabel('Talebi Kapat')
                    .setStyle('DANGER')
            );

            await channel.send({ content: `${buttonInteraction.user} ${yetkiliRolu}`, embeds: [ticketEmbed], components: [closeRow] });
            await buttonInteraction.reply({ content: `Destek talebiniz oluşturuldu! Kanal: #${channel.name}`, ephemeral: true });

            const closeFilter = i => i.customId === 'close_ticket' && i.channel.id === channel.id;
            const closeCollector = channel.createMessageComponentCollector({ closeFilter, time: 86400000 });

            closeCollector.on('collect', async closeInteraction => {
                await channel.send('Talep kapatılıyor...');
                activeTickets.delete(userId); // Kullanıcının talebini aktif listesinden çıkar
                setTimeout(async () => {
                    await channel.delete();
                }, 5000);
            });
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                mesajKanali.send({ components: [] });
            }
        });c
    },
};
